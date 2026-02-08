"use server"

import { realtime } from "@/lib/realtime"
import { redis } from "@/lib/redis"
import type { MatchPlayer } from "@/lib/types/matchmaking"

const QUEUE_KEY = "cza:matchmaking:queue"
const PLAYER_KEY_PREFIX = "cza:matchmaking:player:"
const TTL_SECONDS = 60 * 5
const TTL_MS = TTL_SECONDS * 1000

const createRoomId = () => {
  const api = globalThis.crypto
  return api?.randomUUID
    ? api.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

type QueuePlayer = MatchPlayer

export type MatchmakingResult =
  | { status: "waiting" }
  | { status: "matched"; roomId: string; players: MatchPlayer[] }

const playerMetaKey = (playerId: string) => `${PLAYER_KEY_PREFIX}${playerId}`

const parsePlayerMeta = (
  value: string | QueuePlayer | null,
  playerId: string,
) => {
  if (!value) {
    return null
  }

  try {
    const parsed =
      typeof value === "string" ? (JSON.parse(value) as QueuePlayer) : value
    if (typeof parsed?.joinedAt !== "number") {
      return null
    }
    if (Date.now() - parsed.joinedAt > TTL_MS) {
      return null
    }
    return parsed
  } catch (error) {
    console.warn("matchmaking: unable to parse player meta", {
      error,
      playerId,
    })
    return null
  }
}

async function fetchPlayerMetas(playerIds: string[]) {
  if (playerIds.length === 0) {
    return {} as Record<string, QueuePlayer | null>
  }

  const keys = playerIds.map((id) => playerMetaKey(id))
  const serialized = (await redis.mget(...keys)) as Array<string | null>
  const entries: Record<string, QueuePlayer | null> = {}

  serialized.forEach((value, index) => {
    const playerId = playerIds[index]
    entries[playerId] = parsePlayerMeta(value, playerId)
  })

  return entries
}

async function emitQueueSize() {
  const total = await redis.zcard(QUEUE_KEY)
  await realtime.emit("matchmaking.queueUpdate", { total })
}

async function storePlayer(player: QueuePlayer) {
  const pipeline = redis.pipeline()
  pipeline.zadd(QUEUE_KEY, { score: player.joinedAt, member: player.id })
  pipeline.set(playerMetaKey(player.id), JSON.stringify(player), {
    ex: TTL_SECONDS,
  })
  await pipeline.exec()
  await emitQueueSize()
}

async function removePlayersFromQueue(
  playerIds: Array<string | undefined | null>,
) {
  const uniqueIds = [
    ...new Set(playerIds.filter((id): id is string => Boolean(id))),
  ]
  if (uniqueIds.length === 0) {
    return
  }

  const pipeline = redis.pipeline()
  for (const playerId of uniqueIds) {
    pipeline.zrem(QUEUE_KEY, playerId)
    pipeline.del(playerMetaKey(playerId))
  }

  await pipeline.exec()
  await emitQueueSize()
}

async function tryMatch(
  currentPlayer: QueuePlayer,
): Promise<QueuePlayer | null> {
  const leaders = (await redis.zrange(QUEUE_KEY, 0, 1)) as string[]
  if (leaders.length < 2) {
    return null
  }

  if (!leaders.includes(currentPlayer.id)) {
    return null
  }

  const opponentId = leaders[0] === currentPlayer.id ? leaders[1] : leaders[0]
  if (!opponentId) {
    return null
  }

  const metas = await fetchPlayerMetas([currentPlayer.id, opponentId])
  const opponent = metas[opponentId]
  const self = metas[currentPlayer.id]

  if (!opponent) {
    await removePlayersFromQueue([opponentId])
    return null
  }

  if (!self) {
    await removePlayersFromQueue([currentPlayer.id])
    return null
  }

  await removePlayersFromQueue([currentPlayer.id, opponentId])
  return opponent
}

export async function joinMatchmaking(options: {
  playerId: string
  username?: string | null
}): Promise<MatchmakingResult> {
  const { playerId, username } = options

  if (!playerId) {
    throw new Error("playerId is required")
  }

  await removePlayersFromQueue([playerId])

  const currentPlayer: QueuePlayer = {
    id: playerId,
    username: username ?? null,
    joinedAt: Date.now(),
  }

  await storePlayer(currentPlayer)

  const opponent = await tryMatch(currentPlayer)
  if (!opponent) {
    return { status: "waiting" }
  }

  const players: QueuePlayer[] = [opponent, currentPlayer]
  const roomId = createRoomId()

  await realtime.emit("matchmaking.matchFound", {
    roomId,
    players,
  })

  return { status: "matched", roomId, players }
}
