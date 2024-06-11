"use client"

import { useEffect, useState } from "react"

import { env } from "@/lib/env.mjs"
import { prepareError } from "@/lib/utils"

import { SpinLoading } from "../spin-loading"
import { Dialog, DialogContent } from "../ui/dialog"

interface verifyProps {
  onSetError: (error: string) => void
  onSetReceiver: (receiver: string) => void
  onSetBuyBtnHidden: (buyBtnHidden: boolean) => void
  onSetTxUrl: (url: string) => void
  onSetOpen: (open: boolean) => void
  open: boolean
  amount: number
  claimedCount: number
  isClaimed: boolean
  ethereum: any
}
export const EmailSection = (props: verifyProps) => {
  const amount = props.amount
  const claimedCount = props.claimedCount
  const isClaimed = props.isClaimed
  const onSetError = props.onSetError
  const onSetReceiver = props.onSetReceiver
  const onSetBuyBtnHidden = props.onSetBuyBtnHidden
  const onSetTxUrl = props.onSetTxUrl
  const onSetOpen = props.onSetOpen
  const open = props.open

  const [verifyLoading, setVerifyLoading] = useState(false)
  const [email, setEmail] = useState("")

  const attestationSite = new URL(env.NEXT_PUBLIC_ATTESTATION_FRONTEND).origin //"http://localhost:3002"
  console.log("open---", open)

  const changeEmail = (event: any) => {
    setEmail(event.target.value)
    onSetReceiver(event.target.value)
    onSetBuyBtnHidden(true)
    onSetTxUrl("")
  }

  const verifyHandler = async () => {
    try {
      console.log("verify---", new Date())

      setVerifyLoading(true)
      onSetBuyBtnHidden(true)
      onSetError("")
      onSetOpen(true)
    } catch (e: any) {
      console.log(e.response)
      onSetError(prepareError(e))
    } finally {
      setVerifyLoading(false)
    }
  }
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("message", (message) => {
        if (message.data.ready) {
          //todo
          const option = { email: email }
          let attestationFrame = document.getElementById("attIframe")
          sendMessage(attestationFrame, option)
        }
      })
    }

    function sendMessage(iframe: any, option: any) {
      let iframeWin = iframe.contentWindow
      iframeWin.postMessage(option, attestationSite)
    }
  }, [attestationSite, email])

  return (
    <>
      <div className="flex items-center">
        <div className="mr-4 w-[100px]  text-right">Email:</div>

        <input
          name="receiver"
          className="mb-2 h-10 w-[300px] border pl-2"
          value={email}
          onChange={(event) => changeEmail(event)}
        />
      </div>

      <div className="flex justify-center">
        <button
          className="hover:bg-Indigo-400 inline-flex h-12 w-40 items-center justify-center rounded-lg border  bg-blue-400 px-4 py-2 text-lg font-medium  text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={email === "" || isClaimed || amount === claimedCount}
          onClick={() => verifyHandler()}
        >
          {verifyLoading && <SpinLoading />} {!verifyLoading && <>E Verify</>}
        </button>
      </div>
      {/* <BuyerVerifyDialog ref={modalRef} /> */}
      <Dialog open={open} onOpenChange={onSetOpen}>
        <DialogContent className="w-[500px] gap-0 rounded-3xl rounded-b-none p-4 pt-14 sm:max-w-md sm:rounded-3xl sm:p-8">
          <iframe
            id="attIframe"
            src={env.NEXT_PUBLIC_ATTESTATION_FRONTEND}
            className="h-[400px] w-[400px]"
          ></iframe>
        </DialogContent>
      </Dialog>
    </>
  )
}
