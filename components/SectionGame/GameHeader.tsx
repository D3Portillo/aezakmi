import AddressBlock from "@/components/AddressBlock"
import { FaHeart } from "react-icons/fa6"

type GameHeaderProps = {
  playerDisplayName: string
  opponentDisplayName: string
  rivalHearts: number
}

export default function GameHeader({
  playerDisplayName,
  opponentDisplayName,
  rivalHearts,
}: GameHeaderProps) {
  return (
    <section className="w-full p-2 max-w-3xl">
      <div className="w-full rounded-2xl border border-white/10 bg-linear-to-r from-cza-purple/10 via-cza-red/25 to-cza-purple/10 p-3 text-white shadow-lg">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div id="current-player" className="flex items-center gap-3">
            <div className="size-10 rounded-xl overflow-hidden">
              <AddressBlock name={playerDisplayName} />
            </div>
            <div>
              <div className="text-xs text-white/60">
                <span>YOU</span>
              </div>
              <div className="font-semibold text-sm">{playerDisplayName}</div>
            </div>
          </div>

          <div className="size-8 rounded-full border-2 border-cza-red/90 bg-cza-red/10 flex items-center justify-center">
            <span className="font-black text-xl">VS</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <div className="text-xs text-white/60 flex items-center justify-end gap-2">
                <span>RIVAL</span>
                <span className="flex items-center gap-0.5 text-cza-red font-black">
                  <FaHeart />
                  <span className="text-white/80 text-[11px]">
                    x{rivalHearts}
                  </span>
                </span>
              </div>
              <div className="font-semibold text-sm">{opponentDisplayName}</div>
            </div>
            <div id="rival-face" className="size-10 rounded-xl overflow-hidden">
              <AddressBlock name={opponentDisplayName} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
