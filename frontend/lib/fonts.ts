import {
  Comic_Neue as Comic,
  JetBrains_Mono as FontMono,
  Rubik as FontRubik,
  Inter,
} from "next/font/google"
import localFont from "next/font/local"

export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const fontSans = FontRubik({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const fontComic = Comic({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-comic",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontNeuePlak = localFont({
  variable: "--font-neue-plak",
  src: [
    { path: "./fonts/Neue-Plak-Extended-Bold.woff", weight: "800" },
    { path: "./fonts/Neue-Plak-Extended-SemiBold.woff", weight: "600" },
  ],
  display: "swap",
})

export const fontClassicComic = localFont({
  variable: "--font-classic-comic",
  src: [{ path: "./fonts/ClassicComic.woff", weight: "400" }],
  display: "swap",
})
