"use client"

import { Facehash } from "facehash"
import { useEffect, useRef, useState } from "react"

import Spinner from "@/components/Spinner"
import { cn } from "@/lib/utils"

import { GiBombingRun } from "react-icons/gi"

type Card = "Cowboy" | "Zombie" | "Alien"

const PLAYER_HAND: Card[] = ["Cowboy", "Zombie", "Alien"]
const CARD_INITIAL: Record<Card, string> = {
  Cowboy: "C",
  Zombie: "Z",
  Alien: "A",
}

export default function SectionGame() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [activeHandIndex, setActiveHandIndex] = useState<number | null>(null)
  const [fanOpened, setFanOpened] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealKey, setRevealKey] = useState(0)
  const [placedCard, setPlacedCard] = useState<Card | null>(null)
  const [rivalPlacedCard, setRivalPlacedCard] = useState<Card | null>(null)
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
    const target = document.getElementById("player-card")
    if (!target) return

    const from = revealCardRef.current.getBoundingClientRect()
    const to = target.getBoundingClientRect()

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
                <div className="text-xs uppercase text-white/60">YOU</div>
                <div className="font-semibold text-sm">NyousStark</div>
              </div>
            </div>

            <div className="size-8 rounded-full border-2 border-cza-red/90 bg-cza-red/10 flex items-center justify-center">
              <span className="font-black text-xl">VS</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <div className="text-xs uppercase text-white/60">RIVAL</div>
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

      <div className="w-full pb-16 grow flex flex-col items-center justify-center">
        <div className="grow w-full flex flex-col items-center justify-center gap-4">
          <div
            className={cn(
              "text-xs flex items-center gap-2 rounded-md border py-1 text-cza-red px-2 border-cza-red/50 transition-opacity duration-300",
              rivalPlacedCard || selectedCard === null
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
              "border border-white/10 rounded-lg w-1/2 max-w-24 flex items-center justify-center",
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
                <span className="font-bold text-white">1 / 3</span>
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
              "border border-white/10 rounded-lg w-1/3 max-w-24 flex items-center justify-center",
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
        className="relative w-80 sm:w-96 h-48 sm:h-56 flex items-end justify-center"
        style={{ perspective: 600 }}
      >
        <nav className="-top-12 sm:-top-20 absolute flex justify-between text-white h-14 -left-14 -right-14">
          <button className="absolute active:scale-98 flex items-center justify-center right-12 sm:right-2 -top-14 size-10 rounded-lg bg-yellow-200 border-yellow-500 border-2">
            <span className="text-5xl -rotate-6">💵</span>
            <div className="absolute text-[0.65rem] leading-none bottom-[120%] text-white font-medium">
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

        {PLAYER_HAND.map((card, idx) => {
          const fanOffsets = [-80, 0, 80]
          const rotations = [-12, 0, 12]
          const lift = [8, 14, 8]
          const isActive = activeHandIndex === idx
          const baseTransform = `translateX(${fanOffsets[idx]}px) translateY(${-lift[idx]}px) rotate(${rotations[idx]}deg)`
          const hoverTransform = `translateX(${fanOffsets[idx]}px) translateY(-30px) rotate(${rotations[idx]}deg)`
          const closedTransform =
            "translateX(0px) translateY(26px) rotate(0deg)"
          const openDelay = idx * 90
          return (
            <div
              key={`${card}-${idx}`}
              className="absolute cursor-pointer bottom-0 w-28 sm:w-40 border-2 border-black/80 rounded-xl flex items-center justify-center text-base font-bold bg-white shadow-xl transition-[transform,box-shadow] duration-200 ease-out select-none"
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

      {selectedCard && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
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
      `}</style>
    </main>
  )
}
