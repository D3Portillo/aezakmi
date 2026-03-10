"use client"

import useSWR from "swr"

import { getPlayerPoints } from "@/actions/points"

export function usePoints(playerId: string | null | undefined) {
  const {
    data: points = 0,
    mutate,
    isLoading,
  } = useSWR(
    playerId ? `points.${playerId}` : null,
    () => getPlayerPoints(playerId!),
  )

  return { points, mutate, isLoading }
}
