"use client"

import { useEffect, useState } from "react"

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

  return (
    <main className="relative flex flex-col items-center min-h-screen p-6">
      <section className="grow">
        <h1 className="text-4xl font-bold mb-6">Card Game</h1>
      </section>

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
              className="absolute cursor-pointer bottom-0 w-28 h-40 sm:w-40 sm:h-52 border-2 border-neutral-800 rounded-xl flex items-center justify-center text-base font-bold bg-white shadow-xl transition-[transform,box-shadow] duration-200 ease-out select-none"
              style={{
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
                <div className="text-sm tracking-[0.6px]">{card}</div>
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
              className="w-64 h-80 sm:w-72 sm:h-96 border-2 border-neutral-900 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center transition-[transform,opacity,filter] duration-500 ease-out will-change-transform"
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
              <div className="mt-3 text-lg font-semibold tracking-[0.6px]">
                {selectedCard}
              </div>
            </div>
            <button
              type="button"
              className="px-5 py-2 rounded-lg border-2 border-neutral-900 bg-neutral-900 text-white font-semibold"
            >
              USE
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
