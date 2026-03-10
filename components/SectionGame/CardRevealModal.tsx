import type { RefObject } from "react"
import { cn } from "@/lib/utils"
import { CARD_ART, type Card } from "./constants"

type CardRevealModalProps = {
  card: Card
  revealOpen: boolean
  revealKey: number
  revealCardRef: RefObject<HTMLDivElement | null>
  selectedIndex: number | null
  cardArtFailed: Record<Card, boolean>
  onClose: () => void
  onUse: () => void
}

function initialRevealTransform(selectedIndex: number | null) {
  if (selectedIndex === 1)
    return "rotateY(0deg) rotateX(12deg) scale(0.9) translateY(22px)"
  if (selectedIndex === 2)
    return "rotateY(-22deg) rotateX(12deg) scale(0.9) translateY(20px)"
  return "rotateY(22deg) rotateX(12deg) scale(0.9) translateY(20px)"
}

export default function CardRevealModal({
  card,
  revealOpen,
  revealKey,
  revealCardRef,
  selectedIndex,
  cardArtFailed,
  onClose,
  onUse,
}: CardRevealModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      <button
        type="button"
        className="absolute backdrop-blur inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div
          key={revealKey}
          ref={revealCardRef}
          className="w-64 sm:w-72 border-2 border-black/90 rounded-2xl shadow-2xl relative overflow-hidden transition-[transform,opacity,filter] duration-500 ease-out will-change-transform"
          style={{
            transform: revealOpen
              ? "rotateY(0deg) rotateX(0deg) scale(1)"
              : initialRevealTransform(selectedIndex),
            opacity: revealOpen ? 1 : 0.6,
            aspectRatio: "5 / 7",
            filter: revealOpen ? "blur(0px)" : "blur(1px)",
            transformOrigin: "bottom center",
            backgroundImage: `url(${CARD_ART[card]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {cardArtFailed[card] && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-semibold bg-black/50">
              {card}
            </div>
          )}
        </div>

        <div
          style={{
            filter:
              card === "Alien"
                ? "drop-shadow(4px 4px rgba(0,255,0,0.4))"
                : "drop-shadow(4px 4px rgba(255,0,0,0.4))",
          }}
        >
          <button
            style={{
              minWidth: "11rem",
              clipPath: "polygon(5% 5%, 100% 0, 95% 95%, 0% 100%)",
            }}
            className={cn(
              "px-10 active:scale-98 group Button flex justify-center items-center text-black py-4 bg-linear-to-l",
              card === "Alien"
                ? "from-cza-green via-yellow-300 to-cza-green"
                : "from-red-500 via-yellow-500 to-red-500",
            )}
            onClick={onUse}
          >
            <style scoped>{`
              @keyframes shine { to { background-position: 200% center; } }
              .Button { background-size: 200% 100%; animation: shine 3s linear infinite; }
            `}</style>
            <span className="text-lg group-hover:scale-98 font-black">
              USE CARD
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
