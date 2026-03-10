import { cn } from "@/lib/utils"
import { FaHeart } from "react-icons/fa6"
import NukeAction from "./Nuke"
import RetreatAction from "./Retreat"
import { CARD_ART, type Card, type PlayerHandCard } from "./constants"

type GamePadProps = {
  battleReady: boolean
  playerHand: PlayerHandCard[]
  playerHearts: number
  activeHandIndex: number | null
  fanOpened: boolean
  cardArtFailed: Record<Card, boolean>
  finalWinner: "player" | "rival" | null
  playerNukeUsed: boolean
  onSelectCard: (card: Card, index: number) => void
  onNukeConfirm: () => void
  onRetreatConfirm: () => void
}

export default function GamePad({
  battleReady,
  playerHand,
  playerHearts,
  activeHandIndex,
  fanOpened,
  cardArtFailed,
  finalWinner,
  playerNukeUsed,
  onSelectCard,
  onNukeConfirm,
  onRetreatConfirm,
}: GamePadProps) {
  return (
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
                0%, 100% { transform: scale(1); }
                40% { transform: scale(1.18); }
                70% { transform: scale(0.95); }
              }
              .zelda-heart { animation: zeldaHeart 1.2s ease-in-out infinite; }
              .zelda-heart-delay { animation-delay: 0.15s; }
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

        <button className="absolute active:scale-98 flex items-center justify-center right-12 sm:right-2 -top-14 size-10 rounded-lg bg-yellow-100 border-yellow-500 border-2">
          <figure className="min-w-22 pointer-events-none scale-95 -rotate-9">
            <img
              className="w-full"
              src="https://i.redd.it/h53ukrijn2cy.gif"
              alt=""
            />
          </figure>
          <div className="absolute text-[0.65rem] leading-none bottom-[125%] text-white font-semibold">
            Feeling <br />
            Confident?
          </div>
        </button>

        <RetreatAction onConfirm={onRetreatConfirm} disabled={!!finalWinner} />

        <NukeAction
          onConfirm={onNukeConfirm}
          disabled={playerNukeUsed || !!finalWinner}
        />
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
          const closedTransform = "translateX(0px) translateY(26px) rotate(0deg)"
          const openDelay = idx * 90

          return (
            <div
              key={handCard.id}
              className="absolute cursor-pointer bottom-0 w-28 sm:w-40 border-2 border-black/80 rounded-xl overflow-hidden shadow-xl transition-all duration-200 ease-out select-none"
              style={{
                aspectRatio: "5 / 7",
                backgroundImage: `url(${CARD_ART[card]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
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
                if (!fanOpened) return
                const target = event.currentTarget
                if (!isActive) target.style.transform = hoverTransform
                target.style.boxShadow = "0 24px 36px rgba(0,0,0,0.24)"
              }}
              onMouseLeave={(event) => {
                if (!fanOpened) return
                const target = event.currentTarget
                if (!isActive) target.style.transform = baseTransform
                target.style.boxShadow = "0 18px 30px rgba(0,0,0,0.2)"
              }}
              onClick={() => onSelectCard(card, idx)}
            >
              <div className="absolute inset-0 bg-black/10" aria-hidden />
              {cardArtFailed[card] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold bg-black/40">
                  {card}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
