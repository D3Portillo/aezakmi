"use server"

import { parseUnits, formatUnits } from "viem"
import { redis } from "@/lib/redis"
import {
  DEFAULT_PLAYER_POINTS,
  MIN_PLAYER_POINTS,
  POINTS_DECIMALS,
} from "@/lib/constants"

const POINTS_KEY_PREFIX = "cza:points:"

// Convert a display-unit number to its 6-decimal integer storage representation
const toStorage = (display: number): bigint =>
  parseUnits(String(display), POINTS_DECIMALS)

// Convert a 6-decimal integer storage value back to a display-unit number.
// Safe for display values up to ~9 billion (well within game point ranges).
const fromStorage = (value: string | number): number =>
  Number(formatUnits(BigInt(String(value)), POINTS_DECIMALS))

// Pre-computed storage constants
const DEFAULT_STORAGE = String(toStorage(DEFAULT_PLAYER_POINTS))
const MIN_STORAGE = String(toStorage(MIN_PLAYER_POINTS))

const pointsKey = (playerId: string) =>
  `${POINTS_KEY_PREFIX}${playerId.toLowerCase()}`

export async function getPlayerPoints(playerId: string): Promise<number> {
  if (!playerId) return DEFAULT_PLAYER_POINTS
  const value = await redis.get(pointsKey(playerId))
  if (value === null) return DEFAULT_PLAYER_POINTS
  return fromStorage(String(value))
}

// Atomically initializes (if missing), increments by delta, and clamps to >= min
const UPDATE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
local base = current == false and tonumber(ARGV[2]) or tonumber(current)
local result = base + tonumber(ARGV[1])
local min = tonumber(ARGV[3])
if result < min then result = min end
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
    [String(toStorage(delta)), DEFAULT_STORAGE, MIN_STORAGE],
  )
  return fromStorage(String(result))
}
