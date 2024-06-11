"use client"

import { useEffect, useState } from "react"

import "@rainbow-me/rainbowkit"
import axios from "axios"
import { ethers } from "ethers"
import { useAccount } from "wagmi"

import { ZERO_ADDRESS } from "@/lib/constants"
import { env } from "@/lib/env.mjs"
import {
  approve,
  getDecimals,
  isApproved,
  provider,
  signAttestation,
} from "@/lib/provider"
import { prepareError } from "@/lib/utils"

import { SpinLoading } from "../spin-loading"
import { Button } from "../ui/button"

export function HeroSection({}: {}) {
  const { address } = useAccount()
  const [approved, setApproved] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [saleLoading, setSaleLoading] = useState(false)
  const [error, setError] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [token, setToken] = useState(
    "0x614cf3021705977c2ef4beb9d7f10a6bf4eaebf6" //smartcat
  )
  const [id, setId] = useState("")
  const blackList = [
    "2198416781",
    "3450203945",
    "3297464744",
    "3218200244",
    "1671773736",
    "991051316",
    "309110477",
    "783788809",
  ]
  const [receiver, setReceiver] = useState("")
  const [erc20, setERC20] = useState(
    ZERO_ADDRESS // "0x3813e82e6f7098b9583fc0f33a962d02018b6803"
  )
  const [price, setPrice] = useState("0.00000005")
  const [image, setImage] = useState("")
  const scriptURI = `${env.NEXT_PUBLIC_FRONTEND_URL}buyer`

  const uploadclick = async () => {
    setSaleLoading(true)

    const erc20Decimals = erc20 === ZERO_ADDRESS ? 18 : await getDecimals(erc20)

    const offer = {
      token: token,
      id: id,
      receiverIdType: "email",
      receiver: receiver,
      erc20: erc20,
      price: ethers.parseUnits(price, erc20Decimals).toString(),
    }
    try {
      setShareLink("")
      setError("")
      const signature = await signAttestation(offer)
      console.log(signature)
      const result = await createAttestation(signature, offer, scriptURI)
      console.log(result.status)
      console.log(result.data)
      setShareLink(
        `${env.NEXT_PUBLIC_TSVIEWER}?chain=${env.NEXT_PUBLIC_ATT_CHAIN_ID}&contract=${result.data.attester}&tokenId=${result.data.uid}&viewType=joyid-token`
      )
      //`https://testnet.joyid.dev/evm-nft/${env.NEXT_PUBLIC_ATT_CHAIN_ID}/${result.data.attester}/${result.data.uid}`
      setSaleLoading(false)
    } catch (e: any) {
      setError(prepareError(e))
      setSaleLoading(false)
    }
  }

  const approveClick = async () => {
    try {
      if (address) {
        setApproveLoading(true)
        await approve(
          token,
          id,
          async (tx: any) => {
            console.log(tx.hash)
            await provider.waitForTransaction(tx.hash, 1)
            await isApproveAble()
            setApproveLoading(false)
          },
          async (res: any) => {
            console.log("###")
          }
        )
      }
    } catch (e) {
      setApproveLoading(false)
      //   showTxRefuseModal()
      //   loading.approve = false
    }
  }

  const isApproveAble = async () => {
    if (address && id && token && !approved) {
      try {
        setApproveLoading(true)
        isApproved(token, id, address).then((el: any) => {
          console.log("approve", el)
          setApproved(el)
          setApproveLoading(false)
        })
      } catch (e) {
        setApproveLoading(false)
      }
    }
  }

  function createAttestation(signature: string, offer: any, scriptURI: string) {
    return axios.post(
      env.NEXT_PUBLIC_BACKEND_BASE + "attestations/selling-offers",
      {
        offer,
        signature,
        scriptURI,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
  }

  const changeId = async (value: any) => {
    console.log(value)
    if (blackList.indexOf(value) > -1) {
      setError("This token has been used!")
      return
    }
    setError("")
    setId(value)
  }

  useEffect(() => {
    async function getMetadata(tokenId: string) {
      if (!tokenId) return
      const result = await axios.get(
        `https://resources.smarttokenlabs.com/80001/${token}/${tokenId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      setImage(result.data.image)
    }
    if (id) {
      isApproveAble()
      getMetadata(id)
    }
  }, [id, isApproveAble, token])

  return (
    <section className="bg-white py-10 md:px-4">
      <div className="container flex w-4/5  flex-col  items-center  rounded border py-9 text-center shadow-lg">
        <div className="flex">
          <div className="w-full">
            <div className="mb-8">
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">Token:</div>
                <input
                  name="token"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                />
              </div>
              <div>
                <a
                  href="https://testnets.opensea.io/collection/smartcat-1"
                  target="_blanck"
                  className="text-blue-700 underline"
                >
                  View NFT list
                </a>
              </div>
              <br />
              <div className="flex items-center">
                <div className="mr-4 w-[100px] text-right">Id:</div>
                <input
                  name="id"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={id}
                  onChange={(event) => changeId(event.target.value)}
                />
              </div>
              <div className="mx-auto my-4  h-40 w-40">
                <img src={image} id="image" alt="preview" className="" />
              </div>
              <br />
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">Receiver:</div>
                <input
                  name="receiver"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={receiver}
                  onChange={(event) => setReceiver(event.target.value)}
                />
              </div>
              <br />
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">ERC20:</div>
                <input
                  name="erc20"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={erc20}
                  onChange={(event) => setERC20(event.target.value)}
                />
              </div>
              <br />
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">Price:</div>
                <input
                  name="price"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
              <br />
              <Button
                onClick={() => approveClick()}
                type="button"
                variant="action"
                className="mr-4 mt-4 h-10"
                disabled={approved || approveLoading}
              >
                Approve
                {approveLoading && <SpinLoading />}
              </Button>
              <Button
                onClick={() => uploadclick()}
                type="button"
                variant="action"
                className="mt-4 h-10"
                disabled={
                  !(approved && address !== undefined && receiver && id)
                }
              >
                Put for sale
                {saleLoading && <SpinLoading />}
              </Button>
              {error && (
                <div className="mb-4  w-[500px] break-words text-left text-red-500 md:w-[400px] lg:w-[700px] ">
                  Error: {error}
                </div>
              )}
              {shareLink && (
                <div className="my-4 w-[500px] break-words text-left md:w-[400px] lg:w-[700px] ">
                  Please share this link to {receiver}:<br />{" "}
                  <a
                    href={shareLink}
                    target="_blank"
                    className="cursor underline"
                  >
                    {shareLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
