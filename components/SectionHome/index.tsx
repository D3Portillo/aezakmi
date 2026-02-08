"use client"

import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import AddressBlock from "@/components/AddressBlock"
import { cn } from "@/lib/utils"

import { IconEye, IconSheriffStar, IconSkull } from "@/components/icons"
import { GiUpgrade } from "react-icons/gi"
import { FiChevronDown, FiCopy } from "react-icons/fi"
import { MdArrowForward } from "react-icons/md"
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5"

import { useAuth } from "@/lib/wallet"
import { useYellowNetwork } from "@/lib/yellow"

type DeckCard = {
  id: string
  label: string
  image: string
  level: number
}

const showTutorialAtom = atomWithStorage("cza.showBattleTutorial", true)

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
  const [isBattleModalOpen, setBattleModalOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useAtom(showTutorialAtom)
  const {
    logout,
    username,
    evmAddress,
    formattedEvmAddress,
    login,
    isConnected,
  } = useAuth()

  useEffect(() => {
    if (!showTutorial) {
      setBattleModalOpen(false)
    }
  }, [showTutorial, setBattleModalOpen])

  return (
    <main className="w-full relative z-1 max-w-3xl sm:pt-5 pb-44 gap-6 mx-auto flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white text-xs font-bold text-black px-1.5 py-0.5 rounded-md">
            TOP RANK #4
          </div>
          <div className="font-bold text-sm text-cza-green">
            2,500 Points (CZA)
          </div>
        </div>

        <div className="flex h-10 grow items-center gap-3 justify-end">
          {isConnected ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setWalletMenuOpen((prev) => !prev)}
                aria-expanded={walletMenuOpen}
              >
                <div className="text-right">
                  <p className="text-sm font-bold">{username}</p>
                  <p className="text-xs text-white/70">{formattedEvmAddress}</p>
                </div>

                <div className="size-10 rounded-lg overflow-hidden">
                  <AddressBlock name={username} />
                </div>
              </button>

              {walletMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-0"
                    onClick={() => setWalletMenuOpen(false)}
                    aria-label="Close wallet menu"
                  />
                  <div className="absolute z-10 right-0 mt-3 w-48 rounded-xl border border-white/15 bg-black shadow-lg p-2">
                    <button
                      type="button"
                      className="w-full flex items-center text-left text-xs p-3 rounded-lg hover:bg-white/7"
                      onClick={() => {
                        navigator.clipboard.writeText(evmAddress || "")
                        setWalletMenuOpen(false)
                      }}
                    >
                      <div className="grow">
                        <div className="font-bold text-cza-green">Wallet</div>
                        <div className="text-xs text-white">
                          <span>{formattedEvmAddress}</span>
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
                </>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <section className="Deck px-4 sm:pt-6 w-full max-w-2xl mx-auto">
        <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur p-4 flex flex-col gap-4">
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
              className="text-sm active:scale-98 font-semibold text-cza-green rounded-full border border-cza-green/30 px-3 py-1 flex items-center gap-1.5"
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
            onClick={() => {
              if (showTutorial) {
                setBattleModalOpen(true)
              } else {
                onPlayGame()
              }
            }}
            className="w-full active:scale-98 flex items-center justify-center gap-4 mt-6 rounded-xl bg-cza-red text-white font-bold py-3"
          >
            <span>PLAY GAME</span>
            <MdArrowForward className="text-xl scale-120" />
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
          <h2 className="text-xl text-center font-semibold">CARD COLLECTION</h2>
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

      {isBattleModalOpen && showTutorial && (
        <BattleModal
          onClose={() => setBattleModalOpen(false)}
          onContinue={(suppress) => {
            if (suppress) {
              setShowTutorial(false)
            }
            setBattleModalOpen(false)
            onPlayGame()
          }}
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
        "flex cursor-pointer active:scale-98 overflow-hidden rounded-xl flex-col gap-2",
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

function BattleModal({
  onClose,
  onContinue,
}: {
  onClose: () => void
  onContinue: (suppress: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [howToPlayOpen, setHowToPlayOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close battle modal"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md transition-all duration-300",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        )}
      >
        <div className="rounded-3xl border border-black/5 bg-white text-black shadow-2xl">
          <div className="flex justify-between items-center gap-3 px-6 pt-7">
            <h3 className="text-2xl font-semibold tracking-tight">
              Ready for the arena?
            </h3>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close battle modal"
              className="ml-auto text-black/50 hover:text-black rounded-full border border-black/10 size-8 grid place-items-center"
            >
              <IoCloseSharp />
            </button>
          </div>
          <p className="px-6 mt-4 text-sm leading-relaxed text-black/70">
            Enter the arena and face another player. Entry costs 3 points — win
            and earn 6 CZA Points.
          </p>

          <div className="px-6 mt-6">
            <div className="rounded-2xl border border-black/10 bg-black/5">
              <button
                type="button"
                onClick={() => setHowToPlayOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={howToPlayOpen}
              >
                <span className="text-sm font-semibold tracking-wide text-black/80">
                  How to play
                </span>
                <FiChevronDown
                  className={cn(
                    "text-lg transition-transform",
                    howToPlayOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden
                />
              </button>
              {howToPlayOpen && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-black/70">
                  <p>
                    Choose your champion wisely: Cowboys beat Zombies, Zombies
                    beat Aliens, Aliens beat Cowboys.
                  </p>
                </div>
              )}
            </div>
          </div>

          <label className="px-6 cursor-pointer mt-6 flex items-center justify-between gap-3 text-sm font-semibold text-black/70">
            <span>Don't show again</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={dontShowAgain}
                onChange={(event) => setDontShowAgain(event.target.checked)}
              />
              <span
                aria-hidden
                className={cn(
                  "size-6 rounded-md border border-black/20 flex items-center justify-center transition-colors",
                  dontShowAgain ? "bg-black text-white" : "bg-transparent",
                )}
              >
                <IoCheckmarkSharp
                  className={cn(
                    "text-base transition-opacity",
                    dontShowAgain ? "opacity-100" : "opacity-0",
                  )}
                />
              </span>
            </span>
          </label>

          <div className="px-6 mt-2 flex items-center justify-between text-sm font-semibold text-black/70">
            <span>Balance</span>
            <span className="text-base font-bold text-black">3 CZA</span>
          </div>

          <div className="px-6 pb-6 pt-4">
            <button
              type="button"
              onClick={() => onContinue(dontShowAgain)}
              className="w-full rounded-2xl bg-black text-white py-4 text-sm font-semibold shadow-lg shadow-black/20 active:scale-98"
            >
              CONTINUE (3CZA)
            </button>
          </div>
        </div>
      </div>
    </div>
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
