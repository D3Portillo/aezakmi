"use client"

import useSWR from "swr"

import { getPlayerPoints } from "@/actions/points"
import { DEFAULT_PLAYER_POINTS } from "@/lib/constants"

export function usePoints(playerId: string | null | undefined) {
  const {
    data: points = DEFAULT_PLAYER_POINTS,
    mutate,
    isLoading,
  } = useSWR(
    playerId ? `points.${playerId}` : null,
    () => getPlayerPoints(playerId!),
  )

  return { points, mutate, isLoading }
}
