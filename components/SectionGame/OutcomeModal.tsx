import { cn } from "@/lib/utils"

type OutcomeModalProps = {
  show: boolean
  outcome: "player" | "rival" | "draw" | null
  onDismiss: () => void
}

export default function OutcomeModal({
  show,
  outcome,
  onDismiss,
}: OutcomeModalProps) {
  if (!show || !outcome) return null

  return (
    <div className="fixed inset-0 z-40 flex gap-8 flex-col items-center justify-center">
      <button
        type="button"
        className="absolute backdrop-blur inset-0 bg-black/70"
        onClick={onDismiss}
        aria-label="Dismiss outcome"
      />
      <div
        className={cn(
          "relative z-10 backdrop-blur px-10 py-7 rounded-3xl border border-white/15 bg-linear-to-br text-white text-center",
          outcome === "player" && "bg-cza-green/10 border-cza-green/30",
          outcome === "rival" && "bg-cza-red/10 border-cza-red/30",
          outcome === "draw" && "bg-white/5 border-white/20",
        )}
      >
        <p className="text-xs tracking-[0.25em] text-white">ROUND RESULTS</p>
        <h3
          className={cn(
            "mt-2 mb-1 text-4xl font-black tracking-tight",
            outcome === "player" && "text-cza-green",
            outcome === "rival" && "text-cza-red",
            outcome === "draw" && "text-white",
          )}
        >
          {outcome === "player" ? "YOU WIN" : outcome === "rival" ? "YOU LOSE" : "DRAW"}
        </h3>
      </div>
    </div>
  )
}
