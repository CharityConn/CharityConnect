import "@/styles/globals.css"
import { Metadata } from "next"

import { siteConfig } from "@/config/site"
import {
  fontClassicComic,
  fontComic,
  fontInter,
  fontMono,
  fontNeuePlak,
  fontSans,
} from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "https://www.smartlayer.network/",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        style={{ scrollBehavior: "smooth" }}
      >
        <head>
          <link
            rel="icon"
            href="/icon.png"
            type="image/png"
            sizes="512x512"
            media="(prefers-color-scheme: light)"
          />
          <link
            rel="icon"
            href="/icon-white.png"
            type="image/png"
            sizes="512x512"
            media="(prefers-color-scheme: dark)"
          />
        </head>
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable,
            fontNeuePlak.variable,
            fontComic.variable,
            fontMono.variable,
            fontInter.variable,
            fontClassicComic.variable
          )}
        >
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}

              <Toaster />

              <TailwindIndicator />
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    </>
  )
}
