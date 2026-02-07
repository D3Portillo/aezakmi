"use client"

import useSWR from "swr"
import { Fragment, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"

import AddressBlock from "@/components/AddressBlock"

import { beautifyAddress, cn } from "@/lib/utils"
import { IconEye, IconSheriffStar, IconSkull } from "@/components/icons"
import { GiUpgrade } from "react-icons/gi"
import { FiCopy } from "react-icons/fi"
import { publicClient } from "@/lib/mainnet"

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
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const { logout, user, login, authenticated: isConnected } = usePrivy()

  const EVM_ADDRESS = user?.wallet?.address
  const formattedAddress = EVM_ADDRESS
    ? beautifyAddress(EVM_ADDRESS)
    : "Loading..."

  const { data: ens = null } = useSWR(
    EVM_ADDRESS ? `ens.${EVM_ADDRESS}` : null,
    async () => {
      if (!EVM_ADDRESS) return null
      return await publicClient.getEnsName({ address: EVM_ADDRESS as any })
    },
  )

  const username = ens || user?.email?.address?.split("@")[0] || "PlayerOne"

  return (
    <main className="w-full max-w-3xl sm:pt-5 pb-44 gap-6 mx-auto flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white text-xs font-bold text-black px-1.5 py-0.5 rounded-md">
            TOP RANK #4
          </div>
          <div className="font-bold text-sm text-cza-green">
            2,500 Points (CZA)
          </div>
        </div>

        {isConnected ? (
          <div className="flex h-10 grow items-center gap-3 justify-end">
            <div className="text-right">
              <p className="text-sm font-bold">{username}</p>
              <p className="text-xs text-white/70">{formattedAddress}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setWalletMenuOpen((prev) => !prev)}
                className="size-10 cursor-pointer rounded-lg overflow-hidden"
                aria-expanded={walletMenuOpen}
              >
                <AddressBlock name={username} />
              </button>

              {walletMenuOpen && (
                <Fragment>
                  <div
                    role="button"
                    tabIndex={-1}
                    onClick={() => setWalletMenuOpen(false)}
                    className="inset-0 fixed z-9"
                  />
                  <div className="absolute z-10 right-0 mt-2 w-48 rounded-xl border border-white/15 bg-black shadow-lg p-2">
                    <button
                      type="button"
                      className="w-full flex items-center text-left text-xs p-3 rounded-lg hover:bg-white/7"
                      onClick={() => {
                        navigator.clipboard.writeText(EVM_ADDRESS || "")
                        setWalletMenuOpen(false)
                      }}
                    >
                      <div className="grow">
                        <div className="font-bold text-cza-green">Wallet</div>
                        <div className="font-mono text-xs text-white">
                          <span>{formattedAddress}</span>
                        </div>
                      </div>
                      <FiCopy className="text-white text-lg" />
                    </button>

                    <div className="h-px my-2 bg-white/10 w-full" />

                    <button
                      type="button"
                      className="w-full h-10 text-left text-xs text-white p-3 rounded-lg hover:bg-white/7"
                      onClick={() => {
                        setWalletMenuOpen(false)
                        logout()
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-10 grow justify-end">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => login()}
              className="flex group cursor-pointer items-center gap-3.5"
            >
              <span className="text-sm font-semibold group-hover:underline underline-offset-4">
                Sign In
              </span>
              <div className="size-10 rounded-lg overflow-hidden">
                <AddressBlock colors={["#ff0000"]} name="ZZ" />
              </div>
            </div>
          </div>
        )}
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
