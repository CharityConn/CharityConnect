"use client"

import { JoyIdWallet } from "@joyid/rainbowkit"
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import {
  braveWallet,
  injectedWallet,
  metaMaskWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"

import { isProd } from "@/lib/constants"
import { env } from "@/lib/env.mjs"

import "@rainbow-me/rainbowkit/styles.css"
import type { ReactNode } from "react"
import { Provider } from "jotai"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { infuraProvider } from "wagmi/providers/infura"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

import { baseSepolia } from "@/lib/viem/chains/definitions/baseSepolia"

console.log("isprod", isProd)
const chainList = [baseSepolia]
const { chains, publicClient, webSocketPublicClient } = configureChains(
  chainList,
  [
    infuraProvider({ apiKey: "6e1527648cc24374bbb19680d506bce8" }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `${env.NEXT_PUBLIC_ATT_BACKEND_BASE}json-rpc`,
      }),
    }),
  ]
)

const projectId = env.NEXT_PUBLIC_PROJECT_ID
const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      JoyIdWallet({
        chains,
        options: {
          // name of your app
          name: "Smart Layer",
          // logo of your app
          logo: "https://www.smartlayer.network/apple-icon.png",
          // JoyID app url that your app is integrated with
          joyidAppURL: isProd
            ? "https://app.joy.id"
            : "https://testnet.joyid.dev",
        },
      }),
      injectedWallet({ chains }),
      safeWallet({ chains }),
      metaMaskWallet({ chains, projectId }),
      walletConnectWallet({ chains, projectId }),
      braveWallet({ chains }),
    ],
  },
])

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider modalSize="compact" chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </Provider>
  )
}
