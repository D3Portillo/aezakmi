export type Card = "Cowboy" | "Zombie" | "Alien"

export const PLAYER_HAND: Card[] = ["Cowboy", "Zombie", "Alien"]

export const CARD_ART: Record<Card, string> = {
  Cowboy: "/cards/cowboy.png",
  Zombie: "/cards/zombie.png",
  Alien: "/cards/alien.png",
}

export const CARD_BACK_ART = "/cards/back.png"

export const CARD_BEATS: Record<Card, Card> = {
  Cowboy: "Zombie",
  Zombie: "Alien",
  Alien: "Cowboy",
}

export const MAX_MATCHES = 3
export const ROUND_TIME_SECONDS = 120
export const GAME_CARD_EVENT = "cza.game.cardPlayed"
export const GAME_NUKE_EVENT = "cza.game.nuke"

export type PlayerHandCard = {
  id: string
  card: Card
}

let cardIdCounter = 0
export const nextCardId = () => `card-${cardIdCounter++}`
export const createInitialHand = (): PlayerHandCard[] =>
  PLAYER_HAND.map((card) => ({ id: nextCardId(), card }))

export const randomBalanceBonus = () => 80 + Math.floor(Math.random() * 220)

export const generateRewards = (winner: "player" | "rival") => {
  const baseTokens = winner === "player" ? 320 : 180
  const tokens = baseTokens + Math.floor(Math.random() * 80)
  const usd = Number((tokens * 0.12).toFixed(2))
  return { tokens, usd }
}
