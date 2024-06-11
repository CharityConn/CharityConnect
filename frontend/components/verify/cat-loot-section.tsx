"use client"

import { useState } from "react"

import { verifyWallet } from "@/lib/catLootService"
import { prepareError } from "@/lib/utils"

import { SpinLoading } from "../spin-loading"
import { Button } from "../ui/button"

interface verifyProps {
  onSetIdAttestation: (att: any) => void
  onSetError: (error: string) => void
  onSetReceiver: (receiver: string) => void
  walletAddress: string
  chainId: string
  isDisabled: boolean
  ethereum: any
}
export const CatLootSection = (props: verifyProps) => {
  const walletAddress = props.walletAddress
  const chainId = props.chainId
  const isDisabled = props.isDisabled
  const onSetIdAttestation = props.onSetIdAttestation
  const onSetError = props.onSetError
  const onSetReceiver = props.onSetReceiver
  const ethereum = props.ethereum

  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const verifyHandler = async () => {
    const walletName = "MetaMask"
    setVerifyLoading(true)
    onSetError("")
    try {
      //todo
      const message = "Verify that you hold a smart cat/loot"

      const signature = await ethereum.send("personal_sign", [
        message,
        walletAddress,
      ])

      const verifyResult = await verifyWallet(message, signature, walletAddress)

      onSetIdAttestation(verifyResult.attestation)
      onSetReceiver(walletAddress)
      setVerifyLoading(false)
      setVerified(true)
    } catch (e: any) {
      console.log(e)

      onSetError(prepareError(e))
      setVerifyLoading(false)
    }
  }

  return (
    <>
      {verified && (
        <>
          <div className="mb-2 font-sans font-bold">
            Claim Redbrick Achievement Token
          </div>
          <div className="font-sans">
            Claim your Achievement Token to tokenize your account
          </div>
        </>
      )}
      {!verified && (
        <>
          <div className="mb-2 font-sans font-bold">
            Verify your Smart Cat or Cat Loot
          </div>
          <div className="font-sans">
            To continue, verify that you are a Smart Cat or Cat Loot NFT holder.{" "}
          </div>
          <Button
            type="button"
            variant="action"
            className="mt-4 h-12 w-[185px]"
            disabled={isDisabled}
            onClick={() => verifyHandler()}
          >
            {verifyLoading && <SpinLoading />}{" "}
            {!verifyLoading && <>Verify NFT</>}
          </Button>
        </>
      )}
    </>
  )
}
