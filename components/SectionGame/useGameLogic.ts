"use client"

import type { Address } from "viem"
import type { MatchPlayer } from "@/lib/types/matchmaking"

import { useCallback, useEffect, useRef, useState } from "react"
import { mutate } from "swr"

import { useAuth } from "@/lib/wallet"
import { beautifyAddress } from "@/lib/utils"
import { useYellowNetwork } from "@/lib/yellow"
import { updatePlayerPoints } from "@/actions/points"

import {
  type Card,
  type PlayerHandCard,
  PLAYER_HAND,
  CARD_ART,
  CARD_BEATS,
  MAX_MATCHES,
  ROUND_TIME_SECONDS,
  GAME_CARD_EVENT,
  GAME_NUKE_EVENT,
  nextCardId,
  createInitialHand,
  generateRewards,
  randomBalanceBonus,
} from "./constants"

export type GameMatch = {
  roomId: string
  players: MatchPlayer[]
  isMock?: boolean
}

type FinalOutcome = "player" | "rival" | "draw"

export function useGameLogic(
  match: GameMatch | null | undefined,
  currentPlayerId: string | null | undefined,
) {
  const { createSession, isSessionActive, sendEvent, latestEvent } =
    useYellowNetwork()
  const createSessionRef = useRef(createSession)
  const sendEventRef = useRef(sendEvent)

  useEffect(() => {
    createSessionRef.current = createSession
    sendEventRef.current = sendEvent
  }, [createSession, sendEvent])

  const { username, formattedEvmAddress, evmAddress } = useAuth()
  const isMockMatch = Boolean(match?.isMock)
  const normalizedCurrentId =
    currentPlayerId?.toLowerCase() ?? evmAddress?.toLowerCase() ?? null
  const players = match?.players ?? []
  const currentPlayer = normalizedCurrentId
    ? players.find((p) => p.id.toLowerCase() === normalizedCurrentId)
    : null
  const opponentPlayer = normalizedCurrentId
    ? players.find((p) => p.id.toLowerCase() !== normalizedCurrentId)
    : (players[1] ?? players[0] ?? null)
  const playerDisplayName =
    currentPlayer?.username ?? username ?? formattedEvmAddress ?? "You"
  const opponentDisplayName =
    opponentPlayer?.username ??
    (opponentPlayer?.id ? beautifyAddress(opponentPlayer.id) : "Opponent")

  const currentRoomId = isMockMatch ? null : match?.roomId ?? null
  const playerSessionAddress =
    currentPlayer?.id ?? currentPlayerId ?? evmAddress ?? null
  const opponentAddress = isMockMatch
    ? null
    : opponentPlayer?.id
      ? (opponentPlayer.id as Address)
      : null

  const [sessionRoomId, setSessionRoomId] = useState<string | null>(null)
  const [sessionPending, setSessionPending] = useState(false)
  const [playerNukeUsed, setPlayerNukeUsed] = useState(false)
  const [opponentNukeUsed, setOpponentNukeUsed] = useState(false)
  const [bonusCardUsed, setBonusCardUsed] = useState(false)
  const [playerHand, setPlayerHand] = useState<PlayerHandCard[]>(() =>
    createInitialHand(),
  )
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [activeHandIndex, setActiveHandIndex] = useState<number | null>(null)
  const [fanOpened, setFanOpened] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealKey, setRevealKey] = useState(0)
  const [placedCard, setPlacedCard] = useState<Card | null>(null)
  const [rivalPlacedCard, setRivalPlacedCard] = useState<Card | null>(null)
  const [battleReady, setBattleReady] = useState(false)
  const [battlePhase, setBattlePhase] = useState<"idle" | "shake" | "flip">(
    "idle",
  )
  const [battleOutcome, setBattleOutcome] = useState<
    "player" | "rival" | "draw" | null
  >(null)
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)
  const [playerHearts, setPlayerHearts] = useState(2)
  const [rivalHearts, setRivalHearts] = useState(2)
  const [currentMatch, setCurrentMatch] = useState(1)
  const [finalWinner, setFinalWinner] = useState<FinalOutcome | null>(null)
  const [finalRewards, setFinalRewards] = useState<{
    tokens: number
    usd: number
  } | null>(null)
  const [finalBannerVisible, setFinalBannerVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS)
  const [cardsFaceUp, setCardsFaceUp] = useState(false)
  const [cardArtFailed, setCardArtFailed] = useState<Record<Card, boolean>>({
    Cowboy: false,
    Zombie: false,
    Alien: false,
  })
  const [movingPlayerCard, setMovingPlayerCard] = useState<{
    card: Card
    from: DOMRect
    to: DOMRect
  } | null>(null)
  const [movingRivalCard, setMovingRivalCard] = useState<{
    card: Card
    from: DOMRect
    to: DOMRect
    width: number
    height: number
    overshoot: { x: number; y: number }
  } | null>(null)
  const [movePlayerActive, setMovePlayerActive] = useState(false)
  const [moveRivalActive, setMoveRivalActive] = useState(false)

  const revealCardRef = useRef<HTMLDivElement | null>(null)
  const finalBannerTimeoutRef = useRef<number | null>(null)
  const lastNukeEventRef = useRef<number | null>(null)
  const lastCardEventRef = useRef<number | null>(null)
  const timeoutResolvedRef = useRef(false)

  const advanceToNextMatch = useCallback(() => {
    if (finalWinner) return
    timeoutResolvedRef.current = false
    setShowOutcomeModal(false)
    setBattleOutcome(null)
    setPlacedCard(null)
    setRivalPlacedCard(null)
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(null)
    setBattleReady(false)
    setBattlePhase("idle")
    setPlayerNukeUsed(false)
    setOpponentNukeUsed(false)
    setTimeLeft(ROUND_TIME_SECONDS)
    setCurrentMatch((prev) => Math.min(prev + 1, MAX_MATCHES))
  }, [finalWinner])

  const declareFinalWinner = useCallback(
    (winner: FinalOutcome) => {
      if (finalWinner) return
      setFinalWinner(winner)
      setFinalRewards(
        winner === "draw" ? { tokens: 0, usd: 0 } : generateRewards(winner),
      )
      setShowOutcomeModal(false)
      setBattleOutcome(null)
      setFinalBannerVisible(false)
      if (winner !== "draw" && evmAddress) {
        const bonus = randomBalanceBonus()
        const playerDelta = winner === "player" ? bonus : -bonus
        updatePlayerPoints(evmAddress, playerDelta)
          .then(() => mutate(`points.${evmAddress}`))
          .catch((error) => {
            console.error("[useGameLogic] updatePlayerPoints failed", error)
          })
        if (!isMockMatch && opponentAddress) {
          updatePlayerPoints(opponentAddress, -playerDelta).catch((error) => {
            console.error("[useGameLogic] updatePlayerPoints (opponent) failed", error)
          })
        }
      }
      if (finalBannerTimeoutRef.current) {
        window.clearTimeout(finalBannerTimeoutRef.current)
      }
      finalBannerTimeoutRef.current = window.setTimeout(
        () => setFinalBannerVisible(true),
        500,
      )
    },
    [finalWinner, evmAddress, isMockMatch, opponentAddress],
  )

  useEffect(() => {
    return () => {
      if (finalBannerTimeoutRef.current) {
        window.clearTimeout(finalBannerTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!currentRoomId) setSessionRoomId(null)
  }, [currentRoomId])

  useEffect(() => {
    if (!currentRoomId || !playerSessionAddress || !opponentAddress) return
    if (isMockMatch) return
    if (sessionRoomId === currentRoomId || sessionPending) return
    const creator = createSessionRef.current
    if (!creator) return
    let cancelled = false
    setSessionPending(true)
    creator(opponentAddress)
      .then(() => {
        if (!cancelled) setSessionRoomId(currentRoomId)
      })
      .catch((error) => {
        if (!cancelled)
          console.error("[SectionGame] createSession failed", error)
      })
      .finally(() => {
        if (!cancelled) setSessionPending(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    currentRoomId,
    opponentAddress,
    playerSessionAddress,
    sessionPending,
    sessionRoomId,
    isMockMatch,
  ])

  useEffect(() => {
    if (!selectedCard) return
    setRevealOpen(false)
    setRevealKey((prev) => prev + 1)
    const timer = window.setTimeout(() => setRevealOpen(true), 40)
    return () => window.clearTimeout(timer)
  }, [selectedCard])

  useEffect(() => {
    const timer = window.setTimeout(() => setFanOpened(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const entries = Object.entries(CARD_ART) as [Card, string][]
    entries.forEach(([card, src]) => {
      const img = new window.Image()
      img.onerror = () =>
        setCardArtFailed((prev) =>
          prev[card] ? prev : { ...prev, [card]: true },
        )
      img.src = src
    })
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeLeft !== 0 || finalWinner) return
    if (timeoutResolvedRef.current) return
    if (battleReady || battlePhase === "flip") return
    timeoutResolvedRef.current = true
    if (playerHearts > rivalHearts) declareFinalWinner("player")
    else if (rivalHearts > playerHearts) declareFinalWinner("rival")
    else declareFinalWinner("draw")
  }, [
    timeLeft,
    finalWinner,
    battleReady,
    battlePhase,
    playerHearts,
    rivalHearts,
    declareFinalWinner,
  ])

  useEffect(() => {
    if (!placedCard || !rivalPlacedCard) {
      setBattleReady(false)
      setBattleOutcome(null)
      setShowOutcomeModal(false)
      return
    }
    const timer = window.setTimeout(() => setBattleReady(true), 500)
    return () => window.clearTimeout(timer)
  }, [placedCard, rivalPlacedCard])

  useEffect(() => {
    if (
      !placedCard ||
      !currentRoomId ||
      !opponentAddress ||
      !playerSessionAddress ||
      !isSessionActive ||
      isMockMatch
    ) {
      return
    }
    const dispatcher = sendEventRef.current
    if (!dispatcher) return
    dispatcher(opponentAddress, GAME_CARD_EVENT, {
      roomId: currentRoomId,
      card: placedCard,
      playerId: playerSessionAddress,
      issuedAt: Date.now(),
    }).catch((error) => {
      console.error("[SectionGame] sendEvent failed", error)
    })
  }, [
    placedCard,
    currentRoomId,
    opponentAddress,
    playerSessionAddress,
    isSessionActive,
    isMockMatch,
  ])

  useEffect(() => {
    if (isMockMatch) return
    if (!latestEvent || latestEvent.method !== GAME_NUKE_EVENT || !currentRoomId)
      return
    const payload = latestEvent.params as {
      roomId?: string
      playerId?: string
      issuedAt?: number
    }
    if (!payload?.roomId || payload.roomId !== currentRoomId) return
    const sender = payload.playerId?.toLowerCase()
    if (!sender || sender === normalizedCurrentId?.toLowerCase()) return
    if (payload.issuedAt && lastNukeEventRef.current === payload.issuedAt) return
    if (payload.issuedAt) lastNukeEventRef.current = payload.issuedAt
    if (opponentNukeUsed) return
    setBattlePhase("idle")
    setBattleReady(false)
    setCardsFaceUp(false)
    setPlacedCard(null)
    setRivalPlacedCard(null)
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(null)
    setMovePlayerActive(false)
    setMoveRivalActive(false)
    setOpponentNukeUsed(true)
    if (playerNukeUsed) {
      setBattleOutcome("draw")
    } else {
      setBattleOutcome("rival")
      setPlayerHearts((prev) => Math.max(0, prev - 1))
    }
    setShowOutcomeModal(true)
  }, [
    latestEvent,
    currentRoomId,
    normalizedCurrentId,
    opponentNukeUsed,
    playerNukeUsed,
    isMockMatch,
  ])

  useEffect(() => {
    if (isMockMatch) return
    if (!latestEvent || latestEvent.method !== GAME_CARD_EVENT || !currentRoomId)
      return
    const payload = latestEvent.params as {
      roomId?: string
      card?: Card
      playerId?: string
      issuedAt?: number
    }
    if (!payload?.roomId || payload.roomId !== currentRoomId) return
    const sender = payload.playerId?.toLowerCase()
    if (!sender || sender === normalizedCurrentId?.toLowerCase()) return
    if (payload.issuedAt && lastCardEventRef.current === payload.issuedAt) return
    if (payload.issuedAt) lastCardEventRef.current = payload.issuedAt
    const card = payload.card
    if (!card || !PLAYER_HAND.includes(card)) return
    animateRivalPlace(card)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestEvent, currentRoomId, normalizedCurrentId, isMockMatch])

  useEffect(() => {
    if (!battleReady) {
      setBattlePhase("idle")
      setBattleOutcome(null)
      setShowOutcomeModal(false)
      return
    }
    setBattlePhase("shake")
    const shakeTimer = window.setTimeout(() => setBattlePhase("flip"), 600)
    return () => window.clearTimeout(shakeTimer)
  }, [battleReady])

  useEffect(() => {
    if (battlePhase !== "flip" || !placedCard || !rivalPlacedCard) {
      setCardsFaceUp(false)
      return
    }
    const revealTimer = window.setTimeout(() => setCardsFaceUp(true), 320)
    return () => window.clearTimeout(revealTimer)
  }, [battlePhase, placedCard, rivalPlacedCard])

  useEffect(() => {
    if (battlePhase !== "flip" || !placedCard || !rivalPlacedCard || battleOutcome)
      return
    const resolveTimer = window.setTimeout(() => {
      const isFinalRound = currentMatch === MAX_MATCHES
      if (placedCard === rivalPlacedCard) {
        setBattleOutcome("draw")
        if (isFinalRound && playerHearts !== rivalHearts) {
          declareFinalWinner(playerHearts > rivalHearts ? "player" : "rival")
        } else {
          setShowOutcomeModal(true)
        }
        return
      }
      const playerWins = CARD_BEATS[placedCard] === rivalPlacedCard
      const nextPlayerHearts = playerWins
        ? playerHearts
        : Math.max(0, playerHearts - 1)
      const nextRivalHearts = playerWins
        ? Math.max(0, rivalHearts - 1)
        : rivalHearts
      setBattleOutcome(playerWins ? "player" : "rival")
      setPlayerHearts(nextPlayerHearts)
      setRivalHearts(nextRivalHearts)
      const heartsFinished = nextPlayerHearts === 0 || nextRivalHearts === 0
      if (heartsFinished || isFinalRound) {
        declareFinalWinner(
          nextPlayerHearts > nextRivalHearts ? "player" : "rival",
        )
        return
      }
      setShowOutcomeModal(true)
    }, 720)
    return () => window.clearTimeout(resolveTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battlePhase, placedCard, rivalPlacedCard, battleOutcome, playerHearts, rivalHearts, currentMatch])

  useEffect(() => {
    if (finalWinner) return
    if (playerHearts <= 0 && rivalHearts <= 0) return
    if (playerHearts <= 0) declareFinalWinner("rival")
    else if (rivalHearts <= 0) declareFinalWinner("player")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHearts, rivalHearts, finalWinner])

  useEffect(() => {
    if (finalWinner) return
    if (
      currentMatch === MAX_MATCHES &&
      battleOutcome === "draw" &&
      showOutcomeModal &&
      playerHearts !== rivalHearts
    ) {
      declareFinalWinner(playerHearts > rivalHearts ? "player" : "rival")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatch, battleOutcome, playerHearts, rivalHearts, showOutcomeModal, finalWinner])

  useEffect(() => {
    if (!showOutcomeModal || !battleOutcome || finalWinner) return
    const resetTimer = window.setTimeout(() => advanceToNextMatch(), 1200)
    return () => window.clearTimeout(resetTimer)
  }, [showOutcomeModal, battleOutcome, advanceToNextMatch, finalWinner])

  const animateRivalPlace = (card: Card) => {
    const source = document.getElementById("rival-face")
    const target = document.getElementById("rival-card")
    if (!target || !source) return
    const from = source.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    const width = to.width
    const height = to.height
    setMovingRivalCard({
      card,
      from: new DOMRect(
        from.left + from.width / 2 - width / 2,
        from.top + from.height / 2 - height / 2,
        width,
        height,
      ),
      to: new DOMRect(
        to.left + to.width / 2 - width / 2,
        to.top + to.height / 2 - height / 2,
        width,
        height,
      ),
      width,
      height,
      overshoot: { x: 6, y: 6 },
    })
    setMoveRivalActive(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMoveRivalActive(true))
    })
  }

  const handleSelectCard = (card: Card, index: number) => {
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(index)
    window.requestAnimationFrame(() => {
      setSelectedCard(card)
      setSelectedIndex(index)
    })
  }

  const handleUse = () => {
    if (!selectedCard || !revealCardRef.current) return
    if (selectedIndex === null) return
    const target = document.getElementById("player-card")
    if (!target) return
    const from = revealCardRef.current.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    const isAboutToHaveOneCard = playerHand.length === 2
    const shouldDrawBonus = isAboutToHaveOneCard && !bonusCardUsed
    setPlayerHand((prev) => {
      const remaining = prev.filter((_, idx) => idx !== selectedIndex)
      if (shouldDrawBonus && remaining.length > 0) {
        const pool = PLAYER_HAND.filter((c) => c !== remaining[0].card)
        if (pool.length > 0) {
          const randomCard = pool[Math.floor(Math.random() * pool.length)]
          return [...remaining, { id: nextCardId(), card: randomCard }]
        }
      }
      return remaining
    })
    if (shouldDrawBonus) setBonusCardUsed(true)
    setMovingPlayerCard({ card: selectedCard, from, to })
    setMovePlayerActive(false)
    setSelectedCard(null)
    setActiveHandIndex(null)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMovePlayerActive(true))
    })
    if (isMockMatch) {
      window.setTimeout(() => {
        animateRivalPlace(
          PLAYER_HAND[Math.floor(Math.random() * PLAYER_HAND.length)],
        )
      }, 2000)
    }
  }

  const handleNukeConfirm = () => {
    if (playerNukeUsed) return
    setBattlePhase("idle")
    setBattleReady(false)
    setCardsFaceUp(false)
    setPlacedCard(null)
    setRivalPlacedCard(null)
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(null)
    setMovePlayerActive(false)
    setMoveRivalActive(false)
    setPlayerNukeUsed(true)
    if (opponentNukeUsed) {
      setBattleOutcome("draw")
    } else {
      setBattleOutcome("player")
      setRivalHearts((prev) => Math.max(0, prev - 1))
    }
    setShowOutcomeModal(true)
    if (
      isMockMatch ||
      !isSessionActive ||
      !opponentAddress ||
      !playerSessionAddress ||
      !currentRoomId
    )
      return
    const dispatcher = sendEventRef.current
    if (!dispatcher) return
    const issuedAt = Date.now()
    lastNukeEventRef.current = issuedAt
    dispatcher(opponentAddress, GAME_NUKE_EVENT, {
      roomId: currentRoomId,
      playerId: playerSessionAddress,
      issuedAt,
    }).catch((error) => {
      console.error("[SectionGame] sendEvent (nuke) failed", error)
    })
  }

  const handleRetreatConfirm = () => {
    declareFinalWinner("rival")
  }

  const handleFinalBannerAccept = () => {
    window.location.reload()
  }

  const handlePlayerCardLand = (card: Card) => {
    setPlacedCard(card)
    setMovingPlayerCard(null)
    setMovePlayerActive(false)
  }

  const handleRivalCardLand = (card: Card) => {
    setRivalPlacedCard(card)
    setMovingRivalCard(null)
    setMoveRivalActive(false)
  }

  return {
    playerDisplayName,
    opponentDisplayName,
    isMockMatch,
    playerHearts,
    rivalHearts,
    currentMatch,
    timeLeft,
    finalWinner,
    finalRewards,
    finalBannerVisible,
    battleReady,
    battlePhase,
    battleOutcome,
    showOutcomeModal,
    placedCard,
    rivalPlacedCard,
    cardsFaceUp,
    playerHand,
    selectedCard,
    selectedIndex,
    activeHandIndex,
    fanOpened,
    revealOpen,
    revealKey,
    movingPlayerCard,
    movingRivalCard,
    movePlayerActive,
    moveRivalActive,
    cardArtFailed,
    playerNukeUsed,
    revealCardRef,
    handleSelectCard,
    handleUse,
    handleNukeConfirm,
    handleRetreatConfirm,
    handleFinalBannerAccept,
    advanceToNextMatch,
    handlePlayerCardLand,
    handleRivalCardLand,
    setSelectedCard,
    setActiveHandIndex,
  }
}
