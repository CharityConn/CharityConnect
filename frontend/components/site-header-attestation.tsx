/* eslint-disable sonarjs/no-duplicate-string */
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog } from "@headlessui/react"

import { HIDE_TOKENMICS_PAGE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  ConnectWalletButton,
  MobileConnectWalletButton,
} from "@/components/connect-wallet-button"
import { HeaderHamburger } from "@/components/header-hamburger"
import { CloseHamburger, Hamburger } from "@/components/icons/hamburger"
import { SmartLayerIcon } from "@/components/icons/smart-layer"

const mainNav = [{ title: "Home", href: "/seller" }]

interface Props {
  menuTheme?: "dark" | "light"
  dialogClassName?: string
  dialogTheme?: "dark" | "light"
}

export function SiteHeaderAttestation({
  menuTheme: theme = "dark",
  dialogTheme = "light",
  ...props
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isMenuLightTheme = theme === "light"

  return (
    <header className={cn("w-full", { "bg-white": isMenuLightTheme })}>
      <nav
        className="container flex h-[66px] items-center justify-between space-x-4 lg:h-[136px]"
        aria-label="Global"
      >
        <HeaderLogo type={isMenuLightTheme ? "black" : "white"} />
        <div className="hidden lg:flex lg:gap-x-8 xl:gap-x-12">
          {mainNav.map((item, index) => {
            return (
              <Link
                key={index}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                href={item.href}
                className={cn(
                  "body-2 relative flex items-center py-2 font-medium",
                  { "text-white": !isMenuLightTheme }
                )}
              >
                {item.title}
                {isActive(item.href, pathname) && (
                  <div className="bg-stl-light-blue absolute inset-x-0 bottom-0 h-1" />
                )}
              </Link>
            )
          })}
        </div>
        <div>
          <HeaderHamburger
            onClick={() => setMobileMenuOpen(true)}
            hamburgerClassName={isMenuLightTheme ? "text-black" : "text-white"}
          />
          <div className="hidden shrink-0 lg:flex">
            <ConnectWalletButton className="h-9 bg-[#2B2E36] px-4 text-white opacity-80 hover:bg-[#595E6A]" />
          </div>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel
          className={cn(
            "fixed inset-0 z-50 w-full overflow-y-auto bg-white sm:ring-1 sm:ring-gray-900/10",
            props.dialogClassName
          )}
        >
          <div className="container flex min-h-screen flex-col justify-between">
            <div>
              <div className="flex h-[66px] items-center justify-between">
                <HeaderLogo type={dialogTheme === "dark" ? "white" : "black"} />
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  {mobileMenuOpen ? (
                    <div
                      className={
                        dialogTheme === "dark" ? "text-white" : "text-gray-700"
                      }
                    >
                      <CloseHamburger className="h-6 w-6" aria-hidden="true" />
                    </div>
                  ) : (
                    <div
                      className={isMenuLightTheme ? "text-black" : "text-white"}
                    >
                      <Hamburger className="h-6 w-6" aria-hidden="true" />
                    </div>
                  )}
                </button>
              </div>
              <div className="flow-root">
                <div className="">
                  <div className="mt-10 space-y-2">
                    {mainNav.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          dialogTheme === "dark"
                            ? "text-white hover:bg-gray-500"
                            : "text-gray-900 hover:bg-gray-50",
                          "heading-3 -mx-3 block rounded-lg px-3  py-2 ",
                          isActive(item.href, pathname) && "text-stl-light-blue"
                        )}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                  <MobileConnectWalletButton />
                </div>
              </div>
            </div>
            <div className="flex flex-col pb-24">
              {/* <Button
                asChild
                variant={
                  dialogTheme === "dark" ? "outline-white" : "outline-black"
                }
                className="mb-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/pass">Your Pass</Link>
              </Button>
              <GetTokenButton /> */}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}

const HeaderLogo = ({ type }: { type: "white" | "black" }) => {
  const Icon = type === "white" ? SmartLayerIcon.white : SmartLayerIcon.black
  return (
    <Link href="/" className="" aria-label="Home">
      <Icon className="h-8 w-44 lg:w-40 xl:h-11 xl:w-64" />
    </Link>
  )
}

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
