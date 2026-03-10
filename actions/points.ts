"use server"

import { redis } from "@/lib/redis"

const POINTS_KEY_PREFIX = "cza:points:"
export const DEFAULT_PLAYER_POINTS = 1500

const pointsKey = (playerId: string) =>
  `${POINTS_KEY_PREFIX}${playerId.toLowerCase()}`

export async function getPlayerPoints(playerId: string): Promise<number> {
  if (!playerId) return DEFAULT_PLAYER_POINTS
  const value = await redis.get(pointsKey(playerId))
  if (value === null) return DEFAULT_PLAYER_POINTS
  return Number(value)
}

// Atomically initializes (if missing), increments by delta, and clamps to >= 0
const UPDATE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
local base = current == false and tonumber(ARGV[2]) or tonumber(current)
local result = base + tonumber(ARGV[1])
if result < 0 then result = 0 end
redis.call('SET', KEYS[1], result)
return result
`

export async function updatePlayerPoints(
  playerId: string,
  delta: number,
): Promise<number> {
  if (!playerId) throw new Error("playerId is required")
  const result = await redis.eval(
    UPDATE_SCRIPT,
    [pointsKey(playerId)],
    [String(delta), String(DEFAULT_PLAYER_POINTS)],
  )
  return Number(result)
}
