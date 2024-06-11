"use client"

import { useState } from "react"

import { fetchNonce, verifyWallet } from "@/lib/redbrickService"
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
  brand: any
}
export const RedbrickSection = (props: verifyProps) => {
  const walletAddress = props.walletAddress
  const chainId = props.chainId
  const isDisabled = props.isDisabled
  const onSetIdAttestation = props.onSetIdAttestation
  const onSetError = props.onSetError
  const onSetReceiver = props.onSetReceiver
  let ethereum = props.ethereum
  const brand = props.brand

  const [verifyLoading, setVerifyLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({
    level: -1,
    avatar:
      "https://store.redbrick.land/dev/avatar/preset/rpm/thumbnail/rpm_002.png",
    email: "",
    name: "",
    point: "",
  })

  const verifyHandler = async () => {
    const walletName = "MetaMask"
    setVerifyLoading(true)
    onSetError("")
    try {
      if (!walletAddress) {
        onSetError("No walletAddress")
      }

      const nonce = await fetchNonce()
      //todo
      const message =
        `\n      Welcome to SLN!\n    \n      Signing is the only way we can truly know\n      that you are the owner of the wallet\n      you are connecting.\n      Signing is a safe, gas-less transaction\n      that does not in any way\n      give REDBRICK permission to perform\n      any transactions with your wallet.\n    \n      Wallet address:\n${walletAddress}\n      \n      Chain ID:\n${Number(
          chainId
        )}\n      Name:\n${walletName}\n      Nonce:${nonce}\n`.toString()

      const signature = await ethereum.send("personal_sign", [
        message,
        walletAddress,
      ])

      //verifyWallet
      const verifyResult = await verifyWallet(message, signature, walletAddress)
      console.log("%%%%", verifyResult)
      setUserInfo(verifyResult.userInfo)
      onSetIdAttestation(verifyResult.attestation)
      onSetReceiver(walletAddress)
      setVerifyLoading(false)

      //as reference
    } catch (e: any) {
      console.log(e)
      onSetError(prepareError(e))
      setVerifyLoading(false)
    }
  }

  return (
    <>
      {userInfo.name && (
        <>
          <div className="mb-2 font-sans font-bold">
            Claim your {brand.name} Achievement Token
          </div>
          <div className="font-sans">
            Claim your Achievement Token to tokenize your account
          </div>

          <div className="justify-left my-4 flex w-full rounded-lg border border-[#EEEEEE] p-2 bg-white">
            <img
              src={userInfo?.avatar}
              className="mr-4 w-[48px]  rounded-full bg-black"
            />

            <div className="text-left">
              <div className="font-bold">{userInfo?.name}</div>
              <div>Level {userInfo?.level}</div>
            </div>
          </div>
        </>
      )}
      {!userInfo.name && (
        <>
          <div className="mb-2 font-sans font-bold">
            Verify your {brand.name} account
          </div>
          <div className="font-sans">
            To continue, verify your {brand.name} account. It should be linked
            to the same wallet you are using to verify.
          </div>

          <Button
            type="button"
            variant="action"
            className="mt-4 h-12 w-[185px]"
            onClick={() => verifyHandler()}
            disabled={isDisabled}
          >
            {verifyLoading && <SpinLoading />}{" "}
            {!verifyLoading && <>Verify acount</>}
          </Button>
        </>
      )}
    </>
  )
}
