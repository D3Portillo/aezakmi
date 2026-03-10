"use client"

import useSWR from "swr"

import { getPlayerPoints, DEFAULT_PLAYER_POINTS } from "@/actions/points"

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
