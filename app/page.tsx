"use client"

import { useMemo, useState } from "react"
import { generateUUID } from "@/lib/utils"

import SectionGame from "@/components/SectionGame"

const PREP_STEPS = ["3", "2", "1", "GO"]
function PrepareScreen({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const renderKey = useMemo(
    () => `prep-step-${stepIndex}-${generateUUID()}`,
    [stepIndex],
  )

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-black">
      <div className="absolute bg-radial from-cza-red/7 to-cza-red/30 inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          key={renderKey}
          style={{
            animation: `s-${renderKey} 600ms ease-in-out forwards`,
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
            transform: scale(1.1) translateY(0px);
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

  if (isGameStarted) return <SectionGame />
  return <PrepareScreen onFinish={() => setIsGameStarted(true)} />
}
