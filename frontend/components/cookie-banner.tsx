"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"

const AGREE_COOKIE_KEY = "sl-cookie"

export const CookieBanner = () => {
  const [initDatadog, setInitDatadog] = useState(false)
  const [initGA, setInitGA] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const hasAgreed = localStorage.getItem(AGREE_COOKIE_KEY) === "true"
    setInitDatadog(hasAgreed)
    setInitGA(hasAgreed)
    setShowBanner(!hasAgreed)
  }, [])

  useEffect(() => {
    if (initDatadog) {
      //   initRum()
      //   initLogs()
    }
  }, [initDatadog])

  const onAgree = () => {
    localStorage.setItem(AGREE_COOKIE_KEY, "true")
    setInitGA(true)
    setInitDatadog(true)
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-20 flex px-4 sm:justify-center sm:px-6"
      )}
    >
      <div
        className={cn(
          "shadow-[0_12px_18px_0_rgba(0,0,0,0.1)]",
          "pointer-events-auto flex w-full max-w-full flex-col gap-2 rounded-xl bg-white p-4 text-black sm:px-8 sm:py-4",
          "sm:w-full sm:max-w-[1145px] sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <span className="body-2 mb-4 sm:mb-0">
          This page uses cookies for analytics purposes.
        </span>
        <div className="flex flex-col gap-3 whitespace-nowrap sm:flex-row">
          <Button asChild variant="outline-black">
            <Link
              href="/privacy"
              className="hover:text-stl-blue"
              aria-label="Privacy Page"
            >
              Learn more
            </Link>
          </Button>
          <Button onClick={onAgree} type="button" variant="action">
            Agree & close
          </Button>
        </div>
      </div>
    </div>
  )
}
