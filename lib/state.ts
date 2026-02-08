import { atomWithStorage } from "jotai/utils"

export const playerBalanceAtom = atomWithStorage<number>(
  "cza.playerBalance",
  1500,
)
