"use client"

import { isDevEnv } from "@/lib/env"
import dynamic from "next/dynamic"
import { Fragment, PropsWithChildren } from "react"

const Balatro = dynamic(() => import("./Balatro"), {
  ssr: false,
})

export default function MainLayout({ children }: PropsWithChildren) {
  // It's painful for my pc to hot-reload canvas
  if (isDevEnv()) return children

  return (
    <Fragment>
      <div className="fixed -z-1 fade-in animate-in pointer-events-none top-0 left-0 h-screen w-screen">
        <div
          className="absolute inset-0 z-1 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        <div className="bg-black/60 backdrop-blur inset-0 z-1 absolute"></div>

        <Balatro
          spinRotation={-7}
          spinSpeed={14}
          color1="#d62828"
          color2="#37f713"
          color3="#000000"
          contrast={5}
          lighting={0.2}
          spinAmount={0.05}
          pixelFilter={100}
          className="size-full"
        />
      </div>

      {children}
    </Fragment>
  )
}
