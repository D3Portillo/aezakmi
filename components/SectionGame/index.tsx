"use client"

import { Facehash } from "facehash"
import { useCallback, useEffect, useRef, useState } from "react"

import Spinner from "@/components/Spinner"
import { cn } from "@/lib/utils"

import { FaHeart } from "react-icons/fa6"
import { GiBombingRun } from "react-icons/gi"

type Card = "Cowboy" | "Zombie" | "Alien"

const PLAYER_HAND: Card[] = ["Cowboy", "Zombie", "Alien"]
const CARD_INITIAL: Record<Card, string> = {
  Cowboy: "C",
  Zombie: "Z",
  Alien: "A",
}

const CARD_BEATS: Record<Card, Card> = {
  Cowboy: "Zombie",
  Zombie: "Alien",
  Alien: "Cowboy",
}

const MAX_MATCHES = 3

type PlayerHandCard = {
  id: string
  card: Card
}

let cardIdCounter = 0
const nextCardId = () => `card-${cardIdCounter++}`
const createInitialHand = (): PlayerHandCard[] =>
  PLAYER_HAND.map((card) => ({
    id: nextCardId(),
    card,
  }))

const generateRewards = (winner: "player" | "rival") => {
  const baseTokens = winner === "player" ? 320 : 180
  const tokens = baseTokens + Math.floor(Math.random() * 80)
  const usd = Number((tokens * 0.12).toFixed(2))
  return { tokens, usd }
}

export default function SectionGame() {
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
  const [finalWinner, setFinalWinner] = useState<"player" | "rival" | null>(
    null,
  )
  const [finalRewards, setFinalRewards] = useState<{
    tokens: number
    usd: number
  } | null>(null)
  const [finalBannerVisible, setFinalBannerVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)

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

  useEffect(() => {
    return () => {
      if (finalBannerTimeoutRef.current) {
        window.clearTimeout(finalBannerTimeoutRef.current)
      }
    }
  }, [])

  const advanceToNextMatch = useCallback(() => {
    if (finalWinner) return
    setShowOutcomeModal(false)
    setBattleOutcome(null)
    setPlacedCard(null)
    setRivalPlacedCard(null)
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(null)
    setBattleReady(false)
    setBattlePhase("idle")
    setCurrentMatch((prev) => Math.min(prev + 1, MAX_MATCHES))
  }, [finalWinner])

  const declareFinalWinner = useCallback(
    (winner: "player" | "rival") => {
      if (finalWinner) return
      setFinalWinner(winner)
      setFinalRewards(generateRewards(winner))
      setShowOutcomeModal(false)
      setBattleOutcome(null)
      setFinalBannerVisible(false)

      if (finalBannerTimeoutRef.current) {
        window.clearTimeout(finalBannerTimeoutRef.current)
      }

      finalBannerTimeoutRef.current = window.setTimeout(() => {
        setFinalBannerVisible(true)
      }, 500)
    },
    [finalWinner],
  )

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
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

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
    if (!battleReady) {
      setBattlePhase("idle")
      setBattleOutcome(null)
      setShowOutcomeModal(false)
      return
    }

    setBattlePhase("shake")
    const shakeTimer = window.setTimeout(() => {
      setBattlePhase("flip")
    }, 600)

    return () => window.clearTimeout(shakeTimer)
  }, [battleReady])

  useEffect(() => {
    if (
      battlePhase !== "flip" ||
      !placedCard ||
      !rivalPlacedCard ||
      battleOutcome
    ) {
      return
    }

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
  }, [
    battlePhase,
    placedCard,
    rivalPlacedCard,
    battleOutcome,
    playerHearts,
    rivalHearts,
    currentMatch,
    declareFinalWinner,
  ])

  useEffect(() => {
    if (finalWinner) return
    if (playerHearts <= 0 && rivalHearts <= 0) return
    if (playerHearts <= 0) {
      declareFinalWinner("rival")
    } else if (rivalHearts <= 0) {
      declareFinalWinner("player")
    }
  }, [playerHearts, rivalHearts, finalWinner, declareFinalWinner])

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
  }, [
    currentMatch,
    battleOutcome,
    playerHearts,
    rivalHearts,
    showOutcomeModal,
    declareFinalWinner,
    finalWinner,
  ])

  useEffect(() => {
    if (!showOutcomeModal || !battleOutcome || finalWinner) return

    const resetTimer = window.setTimeout(() => {
      advanceToNextMatch()
    }, 1200)

    return () => window.clearTimeout(resetTimer)
  }, [showOutcomeModal, battleOutcome, advanceToNextMatch, finalWinner])

  const handleSelectCard = (card: Card, index: number) => {
    setSelectedCard(null)
    setSelectedIndex(null)
    setActiveHandIndex(index)
    window.requestAnimationFrame(() => {
      setSelectedCard(card)
      setSelectedIndex(index)
    })
  }

  const initialRevealTransform = () => {
    if (selectedIndex === 1) {
      return "rotateY(0deg) rotateX(12deg) scale(0.9) translateY(22px)"
    }
    if (selectedIndex === 2) {
      return "rotateY(-22deg) rotateX(12deg) scale(0.9) translateY(20px)"
    }
    return "rotateY(22deg) rotateX(12deg) scale(0.9) translateY(20px)"
  }

  const handleUse = () => {
    if (!selectedCard || !revealCardRef.current) return
    if (selectedIndex === null) return
    const target = document.getElementById("player-card")
    if (!target) return

    const from = revealCardRef.current.getBoundingClientRect()
    const to = target.getBoundingClientRect()

    setPlayerHand((prev) => prev.filter((_, idx) => idx !== selectedIndex))
    setMovingPlayerCard({ card: selectedCard, from, to })
    setMovePlayerActive(false)
    setSelectedCard(null)
    setActiveHandIndex(null)

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMovePlayerActive(true))
    })

    window.setTimeout(() => {
      const rivalCard =
        PLAYER_HAND[Math.floor(Math.random() * PLAYER_HAND.length)]
      animateRivalPlace(rivalCard)
    }, 2000)
  }

  const animateRivalPlace = (card: Card) => {
    const source = document.getElementById("rival-face")
    const target = document.getElementById("rival-card")
    if (!target || !source) return

    const from = source.getBoundingClientRect()
    const to = target.getBoundingClientRect()

    const width = to.width
    const height = to.height
    const startX = from.left + from.width / 2 - width / 2
    const startY = from.top + from.height / 2 - height / 2
    const endX = to.left + to.width / 2 - width / 2
    const endY = to.top + to.height / 2 - height / 2

    const startRect = new DOMRect(startX, startY, width, height)
    const endRect = new DOMRect(endX, endY, width, height)

    setMovingRivalCard({
      card,
      from: startRect,
      to: endRect,
      width,
      height,
      overshoot: { x: 6, y: 6 },
    })
    setMoveRivalActive(false)

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMoveRivalActive(true))
    })
  }

  return (
    <main className="relative overflow-x-hidden flex flex-col items-center min-h-dvh pb-6 gap-6">
      <section className="w-full p-2 max-w-3xl">
        <div className="w-full rounded-2xl border border-white/10 bg-linear-to-r from-cza-purple/10 via-cza-red/25 to-cza-purple/10 p-3 text-white shadow-lg">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl overflow-hidden">
                <Facehash
                  colors={["#d62828", "#3aff6b", "#7b5cff", "#ffae03"]}
                  enableBlink
                  name="agent-47"
                  size="100%"
                />
              </div>

              <div>
                <div className="text-xs text-white/60">
                  <span>YOU</span>
                </div>

                <div className="font-semibold text-sm">NyousStark</div>
              </div>
            </div>

            <div className="size-8 rounded-full border-2 border-cza-red/90 bg-cza-red/10 flex items-center justify-center">
              <span className="font-black text-xl">VS</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <div className="text-xs text-white/60 flex items-center justify-end gap-2">
                  <span>RIVAL</span>
                  <span className="flex items-center gap-0.5 text-cza-red font-black">
                    <FaHeart />
                    <span className="text-white/80 text-[11px]">
                      x{rivalHearts}
                    </span>
                  </span>
                </div>

                <div className="font-semibold text-sm">Arthur</div>
              </div>

              <div
                id="rival-face"
                className="size-10 rounded-xl overflow-hidden"
              >
                <Facehash
                  colors={["#d62828", "#3aff6b", "#7b5cff", "#ffae03"]}
                  enableBlink
                  name="rrd-47"
                  size="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full min-h-[70dvh] pb-16 grow flex flex-col items-center justify-center">
        <div className="grow w-full flex flex-col items-center justify-center gap-4">
          <div
            className={cn(
              "text-xs flex items-center gap-2 rounded-md border py-1 text-cza-red px-2 border-cza-red/50 transition-opacity duration-300",
              selectedIndex === null || rivalPlacedCard
                ? "opacity-0 pointer-events-none"
                : "opacity-100",
            )}
          >
            <span>Waiting for rival</span>
            <Spinner themeSize="size-3" />
          </div>

          <div
            id="rival-card"
            style={{
              aspectRatio: "5 / 7",
            }}
            className={cn(
              "border border-white/10 rounded-lg w-1/2 max-w-24 flex items-center justify-center battle-card-container",
              battlePhase === "shake" && "battle-card-shake",
              battlePhase === "flip" && "battle-card-flip",
              rivalPlacedCard
                ? "bg-white/15"
                : "bg-white/10 delay-150 animate-[pulse_1500ms_infinite_linear]",
            )}
          >
            {rivalPlacedCard ? (
              <div className="flex flex-col items-center gap-1 text-white">
                <div className="text-2xl leading-none">
                  {CARD_INITIAL[rivalPlacedCard]}
                </div>
                <div className="text-[11px] uppercase">{rivalPlacedCard}</div>
              </div>
            ) : (
              <p className="text-xs opacity-40 text-center p-2">Rival card</p>
            )}
          </div>
        </div>

        <div className="w-full py-8 max-w-2xl">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-white/20" aria-hidden />

            <div className="relative z-1 bg-black flex items-center gap-4 px-4 text-white/90">
              <div className="flex w-20 items-baseline gap-2">
                <span className="text-xs ml-auto uppercase text-white/60">
                  TIME
                </span>
                <span className="font-bold w-10 text-center tabular-nums text-cza-red">
                  {timeLeft.toString().padStart(2, "0")}s
                </span>
              </div>

              <div className="h-5 w-px -rotate-6 bg-white/20" aria-hidden />

              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase text-white/60">GAME</span>
                <span className="font-bold text-white">
                  {currentMatch} / {MAX_MATCHES}
                </span>
              </div>

              <div className="h-5 w-px rotate-6 bg-white/20" aria-hidden />

              <div className="flex w-20 items-baseline gap-2">
                <span className="text-xs uppercase text-white/60">LOOT</span>
                <span className="font-bold text-white">$0</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grow w-full flex flex-col items-center justify-center gap-4">
          <div
            id="player-card"
            style={{
              aspectRatio: "5 / 7",
            }}
            className={cn(
              "border border-white/10 rounded-lg w-1/3 max-w-24 flex items-center justify-center battle-card-container",
              battlePhase === "shake" && "battle-card-shake",
              battlePhase === "flip" && "battle-card-flip",
              placedCard
                ? "bg-white/15"
                : "bg-white/10 animate-[pulse_1500ms_infinite_linear]",
            )}
          >
            {placedCard ? (
              <div className="flex flex-col items-center gap-1 text-white">
                <div className="text-2xl leading-none">
                  {CARD_INITIAL[placedCard]}
                </div>
                <div className="text-[11px] uppercase">{placedCard}</div>
              </div>
            ) : (
              <p className="text-xs opacity-40 text-center p-2">
                Pick your
                <br />
                card
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        id="game-pad"
        className="relative w-80 sm:w-96 h-48 sm:h-56"
        style={{
          perspective: 600,
          transform: battleReady ? "translateY(72px)" : "translateY(0px)",
          transition: "transform 320ms cubic-bezier(0.4, 0.0, 0.2, 1)",
        }}
      >
        <nav className="-top-12 sm:-top-20 absolute flex justify-between text-white h-14 -left-14 -right-14">
          <button className="absolute active:scale-98 flex items-center justify-center left-12 sm:left-2 -top-10 size-10">
            <div className="-space-x-3 -rotate-9 flex items-center">
              <style>{`
              @keyframes zeldaHeart {
                0%,
                100% {
                  transform: scale(1);
                }
                40% {
                  transform: scale(1.18);
                }
                70% {
                  transform: scale(0.95);
                }
              }

              .zelda-heart {
                animation: zeldaHeart 1.2s ease-in-out infinite;
              }

              .zelda-heart-delay {
                animation-delay: 0.15s;
              }
            `}</style>
              <span className="text-2xl drop-shadow zelda-heart">
                <FaHeart className="drop-shadow text-cza-red" />
              </span>
              {playerHearts > 1 && (
                <span className="text-2xl drop-shadow zelda-heart zelda-heart-delay">
                  <FaHeart className="drop-shadow text-cza-red" />
                </span>
              )}
            </div>

            <strong className="ml-1">x{playerHearts}</strong>
          </button>

          <button className="absolute active:scale-98 flex items-center justify-center right-12 sm:right-2 -top-14 size-10 rounded-lg bg-yellow-200 border-yellow-500 border-2">
            <span className="text-5xl -rotate-6">💵</span>
            <div className="absolute text-[0.65rem] leading-none bottom-[125%] text-white font-semibold">
              Feeling <br />
              Confident?
            </div>
          </button>

          <button
            className="relative active:scale-98 -rotate-6 py-4 bg-linear-to-br from-red-950 to-cza-red"
            style={{
              clipPath: "polygon(5% 9%, 80% 11%, 100% 100%, 0% 100%)",
            }}
          >
            <span className="font-semibold text-lg block text-white pl-10 pr-14">
              RETREAT
            </span>
          </button>

          <button
            className="relative active:scale-98 rotate-6 py-4 bg-linear-to-br from-cza-red to-cza-yellow"
            style={{
              clipPath: "polygon(95% 9%, 20% 11%, 0% 100%, 100% 100%)",
            }}
          >
            <span className="font-semibold text-lg flex items-center gap-2 text-white pl-14 pr-10">
              <span>NUKE</span>
              <GiBombingRun className="rotate-x-180 rotate-12" />
            </span>
          </button>
        </nav>

        <div
          className={cn(
            "relative w-full h-full flex items-end justify-center transition-opacity duration-300",
            battleReady ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          {playerHand.map((handCard, idx) => {
            const card = handCard.card
            const count = playerHand.length
            const fanOffsets =
              count === 1 ? [0] : count === 2 ? [-60, 60] : [-80, 0, 80]
            const rotations =
              count === 1 ? [0] : count === 2 ? [-10, 10] : [-12, 0, 12]
            const lift = count === 1 ? [10] : count === 2 ? [8, 8] : [8, 14, 8]
            const isActive = activeHandIndex === idx
            const baseTransform = `translateX(${fanOffsets[idx]}px) translateY(-${lift[idx]}px) rotate(${rotations[idx]}deg)`
            const hoverTransform = `translateX(${fanOffsets[idx]}px) translateY(-30px) rotate(${rotations[idx]}deg)`
            const closedTransform =
              "translateX(0px) translateY(26px) rotate(0deg)"
            const openDelay = idx * 90

            return (
              <div
                key={handCard.id}
                className="absolute cursor-pointer bottom-0 w-28 sm:w-40 border-2 border-black/80 rounded-xl flex items-center justify-center text-base font-bold bg-white shadow-xl transition-all duration-200 ease-out select-none"
                style={{
                  aspectRatio: "5 / 7",
                  transform: fanOpened
                    ? isActive
                      ? hoverTransform
                      : baseTransform
                    : closedTransform,
                  transformOrigin: "bottom center",
                  transition: fanOpened
                    ? undefined
                    : `transform 555ms ease-out ${openDelay}ms`,
                }}
                onMouseEnter={(event) => {
                  // Early return if fan is not opened
                  if (!fanOpened) return

                  const target = event.currentTarget
                  if (!isActive) {
                    target.style.transform = hoverTransform
                  }
                  target.style.boxShadow = "0 24px 36px rgba(0,0,0,0.24)"
                }}
                onMouseLeave={(event) => {
                  // Early return if fan is not opened
                  if (!fanOpened) return

                  const target = event.currentTarget
                  if (!isActive) {
                    target.style.transform = baseTransform
                  }
                  target.style.boxShadow = "0 18px 30px rgba(0,0,0,0.2)"
                }}
                onClick={() => handleSelectCard(card, idx)}
              >
                <div className="flex flex-col items-center gap-1.5 text-black">
                  <div className="text-5xl leading-none">
                    {CARD_INITIAL[card]}
                  </div>
                  <div className="text-sm">{card}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            className="absolute backdrop-blur-xs inset-0 bg-black/50"
            onClick={() => {
              setSelectedCard(null)
              setActiveHandIndex(null)
            }}
            aria-label="Close"
          />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div
              key={revealKey}
              ref={revealCardRef}
              className="w-64 sm:w-72 border-2 border-black/90 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center transition-[transform,opacity,filter] duration-500 ease-out will-change-transform"
              style={{
                transform: revealOpen
                  ? "rotateY(0deg) rotateX(0deg) scale(1)"
                  : initialRevealTransform(),
                opacity: revealOpen ? 1 : 0.6,
                aspectRatio: "5 / 7",
                filter: revealOpen ? "blur(0px)" : "blur(1px)",
                transformOrigin: "bottom center",
              }}
            >
              <div className="text-6xl leading-none">
                {CARD_INITIAL[selectedCard]}
              </div>
              <div className="mt-3 text-lg font-semibold">{selectedCard}</div>
            </div>

            <div style={{ filter: "drop-shadow(4px 4px black)" }}>
              <button
                style={{
                  minWidth: "10rem",
                  clipPath: "polygon(5% 5%, 100% 0, 95% 95%, 0% 100%)",
                }}
                className="px-10 active:scale-98 group Button flex justify-center items-center text-black py-4 bg-linear-to-l from-cza-green via-yellow-300 to-cza-green"
                onClick={handleUse}
              >
                <style scoped>{`
                  @keyframes shine {
                    to {
                      background-position: 200% center;
                    }
                  }

                  .Button {
                    background-size: 200% 100%;
                    animation: shine 3s linear infinite;
                  }
                `}</style>

                <span className="text-lg group-hover:scale-98 font-black">
                  USE CARD
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {movingPlayerCard && (
        <div
          className="fixed z-30 pointer-events-none"
          style={{
            left: movingPlayerCard.from.left,
            top: movingPlayerCard.from.top,
            width: movingPlayerCard.from.width,
            height: movingPlayerCard.from.height,
            transformOrigin: "top left",
            transform: movePlayerActive
              ? `translate(${movingPlayerCard.to.left - movingPlayerCard.from.left}px, ${
                  movingPlayerCard.to.top - movingPlayerCard.from.top
                }px) scale(${movingPlayerCard.to.width / movingPlayerCard.from.width}, ${
                  movingPlayerCard.to.height / movingPlayerCard.from.height
                })`
              : "translate(0px, 0px) scale(1)",
            transition: "transform 320ms ease-out, opacity 120ms ease-out",
            transitionDelay: movePlayerActive ? "0ms, 224ms" : "0ms, 0ms",
            opacity: movePlayerActive ? 0 : 1,
          }}
          onTransitionEnd={() => {
            setPlacedCard(movingPlayerCard.card)
            setMovingPlayerCard(null)
            setMovePlayerActive(false)
          }}
        >
          <div className="w-full h-full border-2 border-black/90 rounded-xl bg-white shadow-2xl flex flex-col items-center justify-center">
            <div className="text-3xl leading-none">
              {CARD_INITIAL[movingPlayerCard.card]}
            </div>
            <div className="mt-1 text-xs font-semibold">
              {movingPlayerCard.card}
            </div>
          </div>
        </div>
      )}

      {movingRivalCard && (
        <div
          className="fixed z-10 pointer-events-none"
          style={{
            left: movingRivalCard.from.left,
            top: movingRivalCard.from.top,
            width: movingRivalCard.width,
            height: movingRivalCard.height,
            transformOrigin: "top left",
            transform: moveRivalActive
              ? `translate(${movingRivalCard.to.left - movingRivalCard.from.left + movingRivalCard.overshoot.x}px, ${
                  movingRivalCard.to.top -
                  movingRivalCard.from.top +
                  movingRivalCard.overshoot.y
                }px)`
              : "translate(0px, 0px)",
            transition: "transform 320ms ease-out",
            opacity: 1,
            animation: moveRivalActive ? "rivalFade 320ms ease-out" : "none",
          }}
          onTransitionEnd={() => {
            setRivalPlacedCard(movingRivalCard.card)
            setMovingRivalCard(null)
            setMoveRivalActive(false)
          }}
        >
          <div className="w-full h-full border-2 border-black/90 rounded-xl bg-white shadow-2xl flex flex-col items-center justify-center">
            <div className="text-3xl leading-none">
              {CARD_INITIAL[movingRivalCard.card]}
            </div>
            <div className="mt-1 text-xs font-semibold">
              {movingRivalCard.card}
            </div>
          </div>
        </div>
      )}

      {showOutcomeModal && battleOutcome && (
        <div className="fixed inset-0 z-40 flex gap-8 flex-col items-center justify-center">
          <button
            type="button"
            className="absolute backdrop-blur inset-0 bg-black/70"
            onClick={advanceToNextMatch}
            aria-label="Dismiss outcome"
          />
          <div
            className={cn(
              "relative z-10 backdrop-blur-lg px-10 py-7 rounded-3xl border border-white/15 bg-linear-to-br text-white text-center",
              battleOutcome === "player" &&
                "bg-cza-green/10 border-cza-green/30",
              battleOutcome === "rival" && "bg-cza-red/10 border-cza-red/30",
              battleOutcome === "draw" && "bg-white/10 border-white/30",
            )}
          >
            <p className="text-xs tracking-[0.25em] text-white/60">
              BATTLE RESULT
            </p>

            <h3
              className={cn(
                "mt-2 mb-1 text-4xl font-black tracking-tight",
                battleOutcome === "player" && "text-cza-green",
                battleOutcome === "rival" && "text-cza-red",
                battleOutcome === "draw" && "text-white",
              )}
            >
              {battleOutcome === "player"
                ? "YOU WIN"
                : battleOutcome === "rival"
                  ? "YOU LOSE"
                  : "DRAW"}
            </h3>
          </div>
        </div>
      )}

      {finalWinner && finalRewards && finalBannerVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" aria-hidden />
          <div className="relative max-w-xl w-full text-center text-white rounded-4xl border border-white/20 bg-linear-to-b from-[#120418] via-[#220826] to-[#0b0210] px-10 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">
              Match Winner
            </p>
            <h2 className="mt-4 text-5xl sm:text-6xl font-black tracking-tight">
              {finalWinner === "player" ? "NyousStark" : "Arthur"}
            </h2>
            <p className="mt-3 text-base text-white/70">
              {finalWinner === "player"
                ? "Congratulations on your victory!"
                : "Better luck next time."}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/15 bg-white/5 py-5">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Tokens
                </p>
                <p className="mt-2 text-3xl font-black text-cza-yellow">
                  {finalRewards.tokens.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 py-5">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  USDC Earned
                </p>
                <p className="mt-2 text-3xl font-black text-cza-green">
                  {`$${finalRewards.usd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style global>{`
        @keyframes rivalFade {
          0% {
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes battleCardShake {
          0% {
            transform: translateX(0px) rotate(0deg);
          }
          20% {
            transform: translateX(-4px) rotate(-1deg);
          }
          40% {
            transform: translateX(4px) rotate(1deg);
          }
          60% {
            transform: translateX(-3px) rotate(-1deg);
          }
          80% {
            transform: translateX(3px) rotate(1deg);
          }
          100% {
            transform: translateX(0px) rotate(0deg);
          }
        }

        @keyframes battleCardFlip {
          0% {
            transform: rotateY(0deg) translateZ(0px);
          }
          35% {
            transform: rotateY(-22deg) translateZ(4px);
          }
          50% {
            transform: rotateY(-180deg) translateZ(8px);
          }
          65% {
            transform: rotateY(-22deg) translateZ(4px);
          }
          100% {
            transform: rotateY(0deg) translateZ(0px);
          }
        }

        .battle-card-container {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .battle-card-shake {
          animation: battleCardShake 180ms ease-in-out 3;
          transform-origin: center;
        }

        .battle-card-flip {
          animation: battleCardFlip 620ms cubic-bezier(0.35, 0, 0.2, 1) forwards;
          transform-origin: center;
        }
      `}</style>
    </main>
  )
}
