import { CARD_ART, CARD_BACK_ART, type Card } from "./constants"

type MovingPlayerCard = { card: Card; from: DOMRect; to: DOMRect }
type MovingRivalCard = {
  card: Card
  from: DOMRect
  to: DOMRect
  width: number
  height: number
  overshoot: { x: number; y: number }
}

type CardFlyAnimationProps = {
  movingPlayerCard: MovingPlayerCard | null
  movingRivalCard: MovingRivalCard | null
  movePlayerActive: boolean
  moveRivalActive: boolean
  cardArtFailed: Record<Card, boolean>
  onPlayerCardLand: (card: Card) => void
  onRivalCardLand: (card: Card) => void
}

export default function CardFlyAnimation({
  movingPlayerCard,
  movingRivalCard,
  movePlayerActive,
  moveRivalActive,
  cardArtFailed,
  onPlayerCardLand,
  onRivalCardLand,
}: CardFlyAnimationProps) {
  return (
    <>
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
            transition: "transform 320ms ease-out",
          }}
          onTransitionEnd={() => onPlayerCardLand(movingPlayerCard.card)}
        >
          <div
            className="w-full h-full border-2 border-black/90 rounded-xl shadow-2xl relative overflow-hidden"
            style={{
              backgroundImage: `url(${CARD_ART[movingPlayerCard.card]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {cardArtFailed[movingPlayerCard.card] && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold bg-black/50">
                {movingPlayerCard.card}
              </div>
            )}
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
          }}
          onTransitionEnd={() => onRivalCardLand(movingRivalCard.card)}
        >
          <div
            className="w-full h-full border-2 border-black/90 rounded-xl shadow-2xl relative overflow-hidden"
            style={{
              backgroundImage: `url(${CARD_BACK_ART})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      )}
    </>
  )
}
