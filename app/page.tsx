"use client"

import { useEffect, useRef, useState } from "react"
import { Facehash } from "facehash"
import Spinner from "@/components/Spinner"

type Card = "Cowboy" | "Zombie" | "Alien"

const PLAYER_HAND: Card[] = ["Cowboy", "Zombie", "Alien"]
const CARD_INITIAL: Record<Card, string> = {
  Cowboy: "C",
  Zombie: "Z",
  Alien: "A",
}

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealKey, setRevealKey] = useState(0)
  const [placedCard, setPlacedCard] = useState<Card | null>(null)
  const [rivalPlacedCard, setRivalPlacedCard] = useState<Card | null>(null)
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

  const handleSelectCard = (card: Card, index: number) => {
    setSelectedCard(null)
    setSelectedIndex(null)
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
    <main className="relative flex flex-col items-center min-h-screen pb-6 gap-6">
      <section className="w-full p-2 max-w-3xl">
        <div className="w-full rounded-2xl border border-white/10 bg-linear-to-r from-cza-purple/10 via-cza-red/25 to-cza-purple/10 px-4 py-3 text-white shadow-lg">
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

      <div className="w-full grow flex flex-col items-center justify-center">
        <div className="grow w-full flex flex-col items-center justify-center gap-4">
          <div
            className={`text-xs flex items-center gap-2 rounded-md border py-1 text-cza-red px-2 border-cza-red/50 transition-opacity duration-300 ${
              rivalPlacedCard ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span>Waiting for rival</span>
            <Spinner themeSize="size-3" />
          </div>

          <div
            id="rival-card"
            style={{
              aspectRatio: "5 / 7",
            }}
            className={`border border-white/10 rounded-lg w-1/2 max-w-24 flex items-center justify-center ${
              rivalPlacedCard
                ? "bg-white/15"
                : "bg-white/10 animate-[pulse_1500ms_infinite_linear]"
            }`}
          >
            {rivalPlacedCard && (
              <div className="flex flex-col items-center gap-1 text-white">
                <div className="text-2xl leading-none">
                  {CARD_INITIAL[rivalPlacedCard]}
                </div>
                <div className="text-[11px] uppercase">{rivalPlacedCard}</div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-white/15" aria-hidden />
            <div className="relative z-1 bg-black flex items-center gap-4 px-4 text-white/90">
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase text-white/60">TIME</span>
                <span className="font-bold text-cza-red">120s</span>
              </div>

              <div className="h-5 w-px rotate-6 bg-white/20" aria-hidden />

              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase text-white/60">MATCH</span>
                <span className="font-bold text-white">1 / 3</span>
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
            className={`border border-white/10 rounded-lg w-1/3 max-w-24 flex items-center justify-center ${
              placedCard
                ? "bg-white/15"
                : "bg-white/10 animate-[pulse_1500ms_infinite_linear]"
            }`}
          >
            {placedCard && (
              <div className="flex flex-col items-center gap-1 text-white">
                <div className="text-2xl leading-none">
                  {CARD_INITIAL[placedCard]}
                </div>
                <div className="text-[11px] uppercase">{placedCard}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative w-80 sm:w-96 h-48 sm:h-56 flex items-end justify-center"
        style={{ perspective: 800 }}
      >
        {PLAYER_HAND.map((card, idx) => {
          const fanOffsets = [-80, 0, 80]
          const rotations = [-12, 0, 12]
          const lift = [8, 14, 8]
          return (
            <div
              key={`${card}-${idx}`}
              className="absolute cursor-pointer bottom-0 w-28 sm:w-40 border-2 border-black/80 rounded-xl flex items-center justify-center text-base font-bold bg-white shadow-xl transition-[transform,box-shadow] duration-200 ease-out select-none"
              style={{
                aspectRatio: "5 / 7",
                transform: `translateX(${fanOffsets[idx]}px) translateY(${-lift[idx]}px) rotate(${rotations[idx]}deg)`,
                transformOrigin: "bottom center",
              }}
              onMouseEnter={(event) => {
                const target = event.currentTarget
                target.style.transform = `translateX(${fanOffsets[idx]}px) translateY(-30px) rotate(${rotations[idx]}deg)`
                target.style.boxShadow = "0 24px 36px rgba(0,0,0,0.24)"
              }}
              onMouseLeave={(event) => {
                const target = event.currentTarget
                target.style.transform = `translateX(${fanOffsets[idx]}px) translateY(${-lift[idx]}px) rotate(${rotations[idx]}deg)`
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
            onClick={() => setSelectedCard(null)}
            aria-label="Close"
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div
              key={revealKey}
              ref={revealCardRef}
              className="w-64 h-80 sm:w-72 sm:h-96 border-2 border-black/90 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center transition-[transform,opacity,filter] duration-500 ease-out will-change-transform"
              style={{
                transform: revealOpen
                  ? "rotateY(0deg) rotateX(0deg) scale(1)"
                  : initialRevealTransform(),
                opacity: revealOpen ? 1 : 0.6,
                filter: revealOpen ? "blur(0px)" : "blur(1px)",
                transformOrigin: "bottom center",
              }}
            >
              <div className="text-6xl leading-none">
                {CARD_INITIAL[selectedCard]}
              </div>
              <div className="mt-3 text-lg font-semibold">{selectedCard}</div>
            </div>
            <button
              type="button"
              className="px-5 py-2 rounded-lg border-2 border-black bg-black text-white font-semibold"
              onClick={handleUse}
            >
              USE
            </button>
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
          className="fixed z-30 pointer-events-none"
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

      <style jsx global>{`
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
