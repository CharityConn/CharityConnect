"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { JOIN_DISCORD_LINK } from "@/lib/constants"
import { Icons } from "@/components/icons"
import { SmartLayerIcon } from "@/components/icons/smart-layer"
import { SmartTokenLabsIcon } from "@/components/icons/stl"

import { CookieBanner } from "./cookie-banner"

export const Footer = () => {
  const pathname = usePathname()

  if (pathname.startsWith("/smartcat/suitup")) {
    return null
  }
  return (
    <>
      <section className="bg-stl-blue-gradient py-12 lg:py-36">
        <div className="container flex flex-col justify-between lg:flex-row">
          <SmartTokenLabsIcon.whiteLogoOnly className="mb-7 w-16 lg:hidden" />

          <div className="lg:heading-4 body-1 text-white">
            We make tokens smart{" "}
          </div>

          <SmartTokenLabsIcon.white className="hidden lg:block" />
        </div>
      </section>

      <section className="bg-black py-12 lg:py-24">
        <div className="container text-white">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <SmartLayerIcon.whiteLogoOnly className="hidden lg:block" />

            <div className="flex grow flex-col">
              <div className="flex grow flex-col justify-between lg:flex-row lg:items-center">
                <div className="body-2 flex">
                  <p className="mr-14">
                    <span className="font-bold">Australia</span>
                    <br />
                    Level 4, 383 George St
                    <br />
                    Sydney NSW 2000 Australia
                  </p>
                  <p>
                    <span className="font-bold">Singapore</span>
                    <br />
                    16 Raffles Quay,
                    <br />
                    #33-03, Singapore 048581
                  </p>
                </div>
                <div className="mt-8 lg:mt-0">
                  <a
                    className="hover:text-[#BDFF02]"
                    href="mailto:sayhi@smarttokenlabs.com"
                  >
                    sayhi@smarttokenlabs.com
                  </a>
                  <div className="flex gap-4 pt-7">
                    <a
                      href="https://twitter.com/SmartLayer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                      aria-label={`Twitter of TokenScript`}
                    >
                      <Icons.twitterWhite className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/company/smart-token-labs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                      aria-label={`LinkedIn of Smart Token Labs`}
                    >
                      <Icons.linkedInWhite className="h-5 w-5" />
                    </a>
                    <a
                      href="https://github.com/TokenScript"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                      aria-label={`GitHub of TokenScript`}
                    >
                      <Icons.githubWhite className="h-5 w-5" />
                    </a>
                    <a
                      href={JOIN_DISCORD_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                      aria-label={`Discord`}
                    >
                      <Icons.discordWhite className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-14 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <Link
                  href="/officiallinks"
                  className="body-2 text-white underline"
                >
                  Official Links and Communication Policy
                </Link>

                <div className="text-sm text-white/60">
                  © {new Date().getFullYear()} All Rights Reserved |{" "}
                  <a
                    className="hover:text-[#BDFF02]"
                    href="https://smarttokenlabs.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Smart Token Labs
                  </a>{" "}
                  |{" "}
                  <Link
                    href="/terms"
                    className="hover:text-[#BDFF02]"
                    aria-label="Terms & Conditions"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  |{" "}
                  <Link
                    href="/privacy"
                    className="hover:text-[#BDFF02]"
                    aria-label="Privacy Policy"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <CookieBanner />
        </div>
      </section>
    </>
  )
}
