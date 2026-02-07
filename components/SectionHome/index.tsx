"use client"

import { useEffect, useState } from "react"

import AddressBlock from "@/components/AddressBlock"

import { beautifyAddress, cn } from "@/lib/utils"
import { IconEye, IconSheriffStar, IconSkull } from "@/components/icons"
import { GiUpgrade } from "react-icons/gi"

const MOCK_ACCOUNT = {
  name: "NyousStark",
  address: "0x8f7cA47E2fe1b4a9b5b4C3298bA39e12C9339Bd7",
}

type DeckCard = {
  id: string
  label: string
  image: string
  level: number
}

const MOCK_DECK: DeckCard[] = [
  {
    id: "cowboy",
    label: "Cowboy",
    image: "/cards/cowboy.png",
    level: 12,
  },
  {
    id: "zombie",
    label: "Zombie",
    image: "/cards/zombie.png",
    level: 9,
  },
  {
    id: "alien",
    label: "Alien",
    image: "/cards/alien.png",
    level: 11,
  },
]

const MOCK_COWBOYS = Array.from({ length: 3 }).map((_, i) => ({
  type: "Cowboy",
  id: `cowboy-${i}`,
  label: "Cowboy",
  image: "/cards/cowboy.png",
  level: Math.floor(Math.random() * 15) + 1,
}))

const MOCK_ZOMBIES = Array.from({ length: 3 }).map((_, i) => ({
  type: "Zombie",
  id: `zombie-${i}`,
  label: "Zombie",
  image: "/cards/zombie.png",
  level: Math.floor(Math.random() * 15) + 1,
}))

const MOCK_ALIENS = Array.from({ length: 3 }).map((_, i) => ({
  type: "Alien",
  id: `alien-${i}`,
  label: "Alien",
  image: "/cards/alien.png",
  level: Math.floor(Math.random() * 15) + 1,
}))

export default function SectionHome({
  onPlayGame,
}: {
  onPlayGame: () => void
}) {
  const [previewCard, setPreviewCard] = useState<DeckCard | null>(null)

  return (
    <main className="w-full max-w-3xl pb-44 gap-6 mx-auto flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white text-xs font-bold text-black px-1.5 py-0.5 rounded-md">
            TOP RANK #4
          </div>
          <div className="font-bold text-sm text-cza-green">
            2,500 Points (CZA)
          </div>
        </div>

        <div className="flex grow items-center gap-3 justify-end">
          <div className="text-right">
            <p className="text-sm font-bold">{MOCK_ACCOUNT.name}</p>
            <p className="text-xs text-white/70">
              {beautifyAddress(MOCK_ACCOUNT.address)}
            </p>
          </div>
          <div className="size-10 rounded-lg overflow-hidden">
            <AddressBlock name="lobby-agent" />
          </div>
        </div>
      </div>

      <section className="Deck px-4 sm:pt-6 w-full max-w-2xl mx-auto">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">YOUR ARENA</p>
              <h2 className="text-lg font-semibold">Game Champions</h2>
            </div>
            <button
              onClick={() => {
                document?.querySelector("#AllCards")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
              className="text-sm font-semibold text-cza-green rounded-full border border-cza-green/40 px-3 py-1 flex items-center gap-1.5"
            >
              <GiUpgrade className="scale-110" />
              <span>CUSTOMIZE</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {MOCK_DECK.map((card) => (
              <Card
                key={`deck-${card.id}`}
                type={card.label}
                imageURL={card.image}
                level={card.level}
                onClick={() => setPreviewCard(card)}
              />
            ))}
          </div>

          <button
            onClick={onPlayGame}
            className="w-full mt-6 rounded-xl bg-cza-red text-white font-bold py-3"
          >
            PLAY GAME
          </button>
        </div>
      </section>

      <section
        id="AllCards"
        className="px-4 pt-12 AllCards w-full max-w-2xl mx-auto"
      >
        <div className="flex uppercase items-center justify-center gap-3">
          <span className="text-cza-red text-lg" aria-hidden>
            ․★✦
          </span>
          <h2 className="text-lg text-center font-semibold">CARD COLLECTION</h2>
          <span className="text-cza-red text-lg" aria-hidden>
            ✦★․
          </span>
        </div>

        <div className="mt-8 bg-linear-to-l via-cza-red/50 pt-3 pb-4">
          <p className="mb-2 text-xs text-center text-white/50">
            Customize game aesthetics (C)
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {MOCK_COWBOYS.map((card) => (
              <Card
                key={`c-${card.id}`}
                type={card.label}
                imageURL={card.image}
                level={card.level}
                onClick={() => setPreviewCard(card)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 bg-linear-to-l via-red-500/50 pt-3 pb-4">
          <p className="mb-2 text-xs text-center text-white/50">
            Customize game aesthetics (Z)
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {MOCK_ZOMBIES.map((card) => (
              <Card
                key={`z-${card.id}`}
                type={card.label}
                imageURL={card.image}
                level={card.level}
                onClick={() => setPreviewCard(card)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 bg-linear-to-l via-cza-green/15 pt-3 pb-4">
          <p className="mb-2 text-xs text-center text-white/50">
            Customize game aesthetics (A)
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {MOCK_ALIENS.map((card) => (
              <Card
                key={`a-${card.id}`}
                type={card.label}
                imageURL={card.image}
                level={card.level}
                onClick={() => setPreviewCard(card)}
              />
            ))}
          </div>
        </div>
      </section>

      {previewCard && (
        <CardPreviewModal
          card={previewCard}
          onClose={() => setPreviewCard(null)}
        />
      )}
    </main>
  )
}

function Card({
  type,
  imageURL,
  level,
  onClick,
}: {
  type: string
  imageURL: string
  level?: number
  onClick?: () => void
}) {
  const Icon =
    type === "Cowboy"
      ? IconSheriffStar
      : type === "Zombie"
        ? IconSkull
        : IconEye

  return (
    <article
      className={cn(
        type === "Alien"
          ? "bg-linear-to-b shadow-lg shadow-cza-green/10 border border-cza-green/40 from-cza-green/0 to-cza-green/7"
          : "bg-linear-to-b shadow-lg shadow-cza-red/15 border border-cza-red/50 from-cza-red/0 to-cza-red/7",
        "flex overflow-hidden rounded-xl flex-col gap-2",
      )}
      onClick={onClick}
    >
      <div className="aspect-5/7">
        <img
          src={imageURL}
          className="size-full object-cover"
          loading="lazy"
          alt=""
        />
      </div>
      <div className="px-3 whitespace-nowrap pb-3 text-xs flex items-center justify-between text-white/80">
        <div className="uppercase flex items-center gap-2 font-bold">
          <div className="size-3 grid place-items-center">
            <Icon />
          </div>
          <div className="hidden sm:block">{type}</div>
        </div>

        <span>LVL {level || "1"}</span>
      </div>
    </article>
  )
}

function CardPreviewModal({
  card,
  onClose,
}: {
  card: DeckCard
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close preview"
      />
      <div
        className={cn(
          "relative z-10 w-full px-2 max-w-[24rem] transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        )}
      >
        <div className="aspect-5/7 w-full rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={card.image}
            alt={`${card.label} card`}
            className="size-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
