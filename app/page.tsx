"use client"

import SectionGame from "@/components/SectionGame"
import { useState } from "react"

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false)

  if (isGameStarted) return <SectionGame />
  return null
}
