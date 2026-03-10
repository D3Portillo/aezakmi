import Spinner from "@/components/Spinner"
import { cn } from "@/lib/utils"
import { CARD_ART, CARD_BACK_ART, MAX_MATCHES, type Card } from "./constants"

type BattleArenaProps = {
  selectedIndex: number | null
  rivalPlacedCard: Card | null
  cardsFaceUp: boolean
  battlePhase: "idle" | "shake" | "flip"
  timeLeft: number
  currentMatch: number
  placedCard: Card | null
}

export default function BattleArena({
  selectedIndex,
  rivalPlacedCard,
  cardsFaceUp,
  battlePhase,
  timeLeft,
  currentMatch,
  placedCard,
}: BattleArenaProps) {
  return (
    <div className="w-full min-h-[70vh] pb-16 grow flex flex-col items-center justify-center">
      <div className="grow w-full flex flex-col items-center justify-center gap-4">
        <div
          className={cn(
            "text-xs flex items-center gap-2 rounded-md border py-1 text-cza-red px-2 border-cza-red/50 transition-opacity duration-300",
            selectedIndex === null || rivalPlacedCard
              ? "opacity-0 pointer-events-none"
              : "opacity-100",
          )}
        >
          <span>Waiting for rival</span>
          <Spinner themeSize="size-3" />
        </div>

        <div
          id="rival-card"
          style={{ aspectRatio: "5 / 7" }}
          className={cn(
            "border bg-white/10 border-white/15 rounded-lg w-1/2 max-w-24 flex items-center justify-center battle-card-container",
            battlePhase === "shake" && "battle-card-shake",
            battlePhase === "flip" && "battle-card-flip",
          )}
        >
          {rivalPlacedCard ? (
            <div
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                backgroundImage: `url(${cardsFaceUp ? CARD_ART[rivalPlacedCard] : CARD_BACK_ART})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                boxShadow: "inset 0 0 22px rgba(0,0,0,0.45)",
              }}
              aria-label={
                cardsFaceUp
                  ? `${rivalPlacedCard} card face`
                  : "Hidden rival card"
              }
            />
          ) : (
            <p className="text-xs opacity-40 text-center p-2">Rival card</p>
          )}
        </div>
      </div>

      <div className="w-full py-8 max-w-2xl">
        <div className="relative flex items-center justify-center">
          <div className="grow">
            <div className="h-px w-full bg-white/20" />
          </div>
          <div className="flex items-center gap-4 px-4 text-white/90">
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
              <span className="text-xs uppercase text-white/60">ROUND</span>
              <span className="font-bold text-white">
                {currentMatch} / {MAX_MATCHES}
              </span>
            </div>
            <div className="h-5 w-px rotate-6 bg-white/20" aria-hidden />
            <div className="flex w-20 items-baseline gap-2">
              <span className="text-xs uppercase text-white/60">LOOT</span>
              <span className="font-bold text-white">$13.4</span>
            </div>
          </div>
          <div className="grow">
            <div className="h-px w-full bg-white/20" />
          </div>
        </div>
      </div>

      <div className="grow w-full flex flex-col items-center justify-center gap-4">
        <div
          id="player-card"
          style={{ aspectRatio: "5 / 7" }}
          className={cn(
            "border border-white/15 rounded-lg w-1/3 max-w-24 flex items-center justify-center battle-card-container",
            placedCard
              ? "bg-white/15"
              : "bg-white/10 animate-[pulse_1500ms_infinite_linear]",
          )}
        >
          {placedCard ? (
            <div
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                backgroundImage: `url(${CARD_ART[placedCard]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                boxShadow: "inset 0 0 22px rgba(0,0,0,0.45)",
              }}
              aria-label={`${placedCard} card face`}
            />
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
  )
}
