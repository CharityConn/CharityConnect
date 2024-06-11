"use client"

import { useAtomValue } from "jotai"

import { JOIN_DISCORD_LINK } from "@/lib/constants"

export const MaintenanceBanner = () => {
  const toggle = { feature_toggle_maintenance: true }
  if (!toggle.feature_toggle_maintenance) {
    return null
  }
  return (
    <div className="bg-stl-blue-gradient w-full">
      <div className="body-2 container flex flex-col items-center justify-center py-4 text-white">
        <div>
          We are upgrading the pass experience! Website is under maintenance!
        </div>
        <div>
          Join us on{" "}
          <a
            href={JOIN_DISCORD_LINK}
            target="_blank"
            className="font-bold underline"
          >
            Discord
          </a>{" "}
          to learn what is coming up next!
        </div>
      </div>
    </div>
  )
}
