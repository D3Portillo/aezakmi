type FinalBannerProps = {
  winner: "player" | "rival" | "draw"
  rewards: { tokens: number; usd: number }
  visible: boolean
  playerDisplayName: string
  opponentDisplayName: string
  onAccept: () => void
}

export default function FinalBanner({
  winner,
  rewards,
  visible,
  playerDisplayName,
  opponentDisplayName,
  onAccept,
}: FinalBannerProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 backdrop-blur bg-black/80"
        aria-hidden
      />
      <div className="relative max-w-xl w-full text-center text-white rounded-4xl border border-white/20 bg-linear-to-br from-cza-green/25 to-black/90 backdrop-blur px-10 py-12">
        <p className="text-xs tracking-[0.5em] text-white/60">
          {winner === "draw" ? "GAME DRAW" : "GAME WINNER"}
        </p>
        <h2 className="mt-4 text-5xl sm:text-6xl font-black tracking-tight">
          {winner === "draw"
            ? "DRAW"
            : winner === "player"
              ? playerDisplayName
              : opponentDisplayName}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 py-5">
            <p className="text-xs text-white">Points Earned</p>
            <p className="mt-2 text-3xl font-black text-white">
              {rewards.tokens.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 py-5">
            <p className="text-xs text-white">USDC Earned</p>
            <p className="mt-2 text-3xl font-black text-cza-green">
              {`$${rewards.usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAccept}
          className="mt-10 text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white transition-colors"
        >
          ACCEPT
        </button>
      </div>
    </div>
  )
}
