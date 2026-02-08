"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { IoCloseSharp } from "react-icons/io5"

import { cn } from "@/lib/utils"

type RetreatActionProps = {
  onConfirm?: () => void | Promise<void>
  disabled?: boolean
}

export default function RetreatAction({
  onConfirm,
  disabled,
}: RetreatActionProps) {
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
    } finally {
      setIsSubmitting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "relative active:scale-98 -rotate-6 py-4 bg-linear-to-br from-red-950 to-cza-red transition-opacity",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        style={{
          clipPath: "polygon(5% 9%, 80% 11%, 100% 100%, 0% 100%)",
        }}
      >
        <span className="font-semibold text-lg block text-white pl-10 pr-14">
          RETREAT
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
              aria-label="Close retreat modal"
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
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
                      RETREAT
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-black">
                      Quit this battle?
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close retreat modal"
                    className="ml-auto text-black/50 hover:text-black rounded-full border border-black/10 size-8 grid place-items-center"
                  >
                    <IoCloseSharp />
                  </button>
                </div>

                <p className="px-6 mt-4 text-sm leading-relaxed text-black/70">
                  Leave now and lose the bounty... are you sure you want to
                  surrender the arena?
                </p>

                <div className="px-6 pb-6 pt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-black/10 py-3 text-sm font-semibold text-black/70 active:scale-98"
                  >
                    Stay
                  </button>
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="rounded-2xl bg-black text-white py-3 text-sm font-semibold shadow-lg shadow-black/20 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    RETREAT NOW
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
