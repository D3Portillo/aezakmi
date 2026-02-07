"use client"

import AddressBlock from "@/components/AddressBlock"

import { beautifyAddress, cn } from "@/lib/utils"
import { FiEdit3 } from "react-icons/fi"
import { IconEye, IconSheriffStar, IconSkull } from "@/components/icons"

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

// 3x3 = 9 total game cards
const MOCK_ALL_CARDS: DeckCard[] = [
  ...Array.from({ length: 3 }).map((_, i) => ({
    type: "Cowboy",
    id: `cowboy-${i}`,
    label: "Cowboy",
    image: "/cards/cowboy.png",
    level: Math.floor(Math.random() * 15) + 1,
  })),

  ...Array.from({ length: 3 }).map((_, i) => ({
    type: "Alien",
    id: `alien-${i}`,
    label: "Alien",
    image: "/cards/alien.png",
    level: Math.floor(Math.random() * 15) + 1,
  })),

  ...Array.from({ length: 3 }).map((_, i) => ({
    type: "Zombie",
    id: `zombie-${i}`,
    label: "Zombie",
    image: "/cards/zombie.png",
    level: Math.floor(Math.random() * 15) + 1,
  })),
]

export default function SectionHome({
  onPlayGame,
}: {
  onPlayGame: () => void
}) {
  return (
    <main className="w-full max-w-3xl pb-20 gap-6 mx-auto flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white text-xs font-bold text-black px-1.5 py-0.5 rounded-md">
            RANK #4
          </div>
          <div className="font-bold text-sm text-cza-green">2,500 CZA</div>
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

      <section className="Deck min-h-[55dvh] px-4 sm:pt-6 w-full max-w-2xl mx-auto">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-white/50">Your deck</p>
              <h2 className="text-lg font-semibold">Arena Loadout</h2>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-cza-green rounded-full border border-cza-green/40 px-3 py-1 flex items-center gap-1"
            >
              <FiEdit3 />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {MOCK_DECK.map((card) => (
              <Card
                key={`deck-${card.id}`}
                type={card.label}
                imageURL={card.image}
                level={card.level}
              />
            ))}
          </div>

          <button
            onClick={onPlayGame}
            className="w-full mt-6 rounded-xl bg-cza-red text-white font-bold py-3"
          >
            PLAY NOW
          </button>
        </div>
      </section>

      <section className="px-4 pt-12 AllCards w-full max-w-2xl mx-auto">
        <div className="flex uppercase items-center justify-center gap-3">
          <span className="text-cza-red text-lg" aria-hidden>
            ․★✦
          </span>
          <h2 className="text-lg text-center font-semibold">Card Collection</h2>
          <span className="text-cza-red text-lg" aria-hidden>
            ✦★․
          </span>
        </div>

        <div className="grid mt-6 grid-cols-3 gap-2 sm:gap-3">
          {MOCK_ALL_CARDS.map((card) => (
            <Card
              key={`deck-${card.id}`}
              type={card.label}
              imageURL={card.image}
              level={card.level}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

function Card({
  type,
  imageURL,
  level,
}: {
  type: string
  imageURL: string
  level?: number
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
          ? "bg-linear-to-b shadow-lg shadow-cza-green-neon/10 border border-cza-green-neon/40 from-cza-green-neon/0 to-cza-green-neon/7"
          : "bg-linear-to-b shadow-lg shadow-cza-red/15 border border-cza-red/50 from-cza-red/0 to-cza-red/7",
        "flex overflow-hidden rounded-xl flex-col gap-2",
      )}
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
