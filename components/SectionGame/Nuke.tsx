"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { GiBombingRun } from "react-icons/gi"
import { IoCloseSharp } from "react-icons/io5"

import { cn } from "@/lib/utils"

type NukeActionProps = {
  onConfirm?: () => void | Promise<void>
  disabled?: boolean
}

export default function NukeAction({ onConfirm, disabled }: NukeActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isModalOpen) {
      setAnimateIn(false)
      return
    }

    const frame = window.requestAnimationFrame(() => setAnimateIn(true))
    return () => window.cancelAnimationFrame(frame)
  }, [isModalOpen])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const closeModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
  }

  const confirm = async () => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      await onConfirm?.()
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "relative active:scale-98 rotate-6 py-4 bg-linear-to-br from-cza-red to-cza-yellow transition-opacity",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        style={{
          clipPath: "polygon(95% 9%, 20% 11%, 0% 100%, 100% 100%)",
        }}
      >
        <span className="font-semibold text-lg flex items-center gap-2 text-white pl-14 pr-10">
          <span>NUKE</span>
          <GiBombingRun className="rotate-x-180 rotate-12" />
        </span>
      </button>

      {isMounted &&
        isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeModal}
              aria-label="Close nuke modal"
            />

            <div
              className={cn(
                "relative z-10 w-full max-w-md transition-all duration-300",
                animateIn
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6",
              )}
            >
              <div className="rounded-3xl border border-black/5 bg-white text-black shadow-2xl">
                <div className="flex items-center gap-3 px-6 pt-7">
                  <div className="size-11 rounded-2xl bg-black/90 text-white grid place-items-center">
                    <GiBombingRun className="text-2xl" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
                      TACTICAL OPTION
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-black">
                      Deploy the NUKE?
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close nuke modal"
                    className="ml-auto text-black/50 hover:text-black rounded-full border border-black/10 size-8 grid place-items-center"
                  >
                    <IoCloseSharp />
                  </button>
                </div>

                <p className="px-6 mt-4 text-sm leading-relaxed text-black/70">
                  Obliterate the rival card and auto-win this round. If both
                  commanders launch, the round ends in a draw.
                </p>

                <div className="px-6 mt-6 space-y-3 text-sm text-black/75">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-widest text-[11px] text-black/50">
                      COST
                    </span>
                    <strong className="text-base text-black">$5.00</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-widest text-[11px] text-black/50">
                      OUTCOME
                    </span>
                    <span>Immediate win (unless rival nukes)</span>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-black/10 py-3 text-sm font-semibold text-black/70 active:scale-98"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="rounded-2xl bg-black text-white py-3 text-sm font-semibold shadow-lg shadow-black/20 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    LAUNCH NUKE
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
