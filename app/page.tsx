"use client"

import { useEffect, useMemo, useState } from "react"
import { generateUUID } from "@/lib/utils"

import { IconSheriffStar } from "@/components/icons"
import SectionGame from "@/components/SectionGame"
import SectionHome from "@/components/SectionHome"

const PREP_STEPS = ["IN", "3", "2", "1", "GO!"]

function PrepareScreen({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const renderKey = useMemo(
    () => `prep-step-${stepIndex}-${generateUUID()}`,
    [stepIndex],
  )

  return (
    <main className="relative overflow-hidden flex min-h-screen items-center justify-center bg-black/70">
      <div className="absolute bg-radial from-cza-black/7 to-cza-red/15 inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          key={renderKey}
          style={{
            animation: `s-${renderKey} 555ms ease-in-out forwards`,
          }}
          className="text-8xl font-black uppercase text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          onAnimationEnd={() => {
            if (stepIndex >= PREP_STEPS.length - 1) {
              return (setStepIndex(0), onFinish())
            }
            setStepIndex((prev) => prev + 1)
          }}
        >
          {PREP_STEPS[stepIndex]}
        </div>
      </div>

      <style global>{`
        @keyframes s-${renderKey} {
          0% {
            opacity: 0;
            transform: scale(0.6) translateY(18px);
            filter: blur(4px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0px);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
            filter: blur(1px);
          }
        }
      `}</style>
    </main>
  )
}

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showPrepare, setShowPrepare] = useState(false)

  useEffect(() => {
    if (!isSearching) return
    const timer = window.setTimeout(() => {
      setIsSearching(false)
      setShowPrepare(true)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [isSearching])

  if (isGameStarted) return <SectionGame />

  if (showPrepare) {
    return <PrepareScreen onFinish={() => setIsGameStarted(true)} />
  }

  if (isSearching) {
    return (
      <main className="relative bg-black/40 flex min-h-screen items-center justify-center">
        <div className="absolute bg-radial from-black/15 to-black/30 inset-0" />
        <div className="relative z-10 animate-in fade-in flex flex-col items-center gap-5 text-white">
          <figure className="size-10 animate-[spin_2500ms_infinite_linear]">
            <IconSheriffStar />
          </figure>
          <div className="text-sm">Searching games...</div>
        </div>
      </main>
    )
  }

  return <SectionHome onPlayGame={() => setIsSearching(true)} />
}
