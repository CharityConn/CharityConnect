"use client"

import { useEffect, useState } from "react"

import "@rainbow-me/rainbowkit"
import axios from "axios"
import { ethers } from "ethers"
import { useAccount } from "wagmi"

import {
  DVP_OFFERCONTRACT_ADDRESS,
  ID_TYPE_CAT_LOOT_HOLDER,
  ID_TYPE_REDBRICK_WALLET,
  ZERO_ADDRESS,
} from "@/lib/constants"
import { env } from "@/lib/env.mjs"
import {
  approveForClaim,
  getDecimals,
  isApprovedForClaim,
  provider,
  signAttestationForClaim,
} from "@/lib/provider"
import { prepareError } from "@/lib/utils"

import { SpinLoading } from "../spin-loading"
import { Button } from "../ui/button"

export function OfferSection({}: {}) {
  const { address } = useAccount()
  const [approved, setApproved] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [saleLoading, setSaleLoading] = useState(false)
  const [error, setError] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [token, setToken] = useState(
    "0x6A55eE0A3E9CE2db407bCDBf88Dd185384404133" //token
  )
  const [receiverIdType, setReceiverIdType] = useState(ID_TYPE_REDBRICK_WALLET)

  const [amount, setAmount] = useState(1)
  const [erc20, setERC20] = useState(
    ZERO_ADDRESS // "0x3813e82e6f7098b9583fc0f33a962d02018b6803"
  )
  const [price, setPrice] = useState("0.00000005")
  const scriptURI = `${env.NEXT_PUBLIC_FRONTEND_URL}claim`

  const makeOfferClick = async () => {
    setSaleLoading(true)

    const erc20Decimals = erc20 === ZERO_ADDRESS ? 18 : await getDecimals(erc20)

    const offer = {
      token: token,
      amount: amount.toString(),
      receiverIdType, //todo
      erc20: erc20,
      price: ethers.parseUnits(price, erc20Decimals).toString(),
    }
    try {
      setShareLink("")
      setError("")
      const signature = await signAttestationForClaim(offer)
      console.log(signature)
      const result = await createClaimingAttestation(
        signature,
        offer,
        scriptURI
      )
      console.log(result.status)
      console.log(result.data)
      setShareLink(
        `${env.NEXT_PUBLIC_STORE_URL}/app/${env.NEXT_PUBLIC_CHAIN_ID}/${result.data.attester}/0/${result.data.uid}?isAttestation=true`
      )
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
        await approveForClaim(
          token,
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
    }
  }

  const isApproveAble = async () => {
    if (address && token && !approved) {
      try {
        setApproveLoading(true)
        isApprovedForClaim(token, address).then((el: any) => {
          console.log("approve", el)
          setApproved(el)
          setApproveLoading(false)
        })
      } catch (e) {
        setApproveLoading(false)
      }
    }
  }

  function createClaimingAttestation(
    signature: string,
    offer: any,
    scriptURI: string
  ) {
    return axios.post(
      env.NEXT_PUBLIC_BACKEND_BASE + "attestations/claiming-offers",
      {
        offer,
        signature,
        scriptURI,
        dvp: DVP_OFFERCONTRACT_ADDRESS,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
  }

  useEffect(() => {
    isApproveAble()
  }, [isApproveAble, token])

  const handleRadioChange = (changeEvent: any) => {
    setReceiverIdType(changeEvent.target.value)
  }

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
              <div className="mb-4">
                <a
                  href="https://testnets.opensea.io/collection/rb404-alpha-testing-2"
                  target="_blanck"
                  className="text-blue-700 underline"
                >
                  View NFT list
                </a>
              </div>
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">Amount:</div>
                <input
                  name="amount"
                  type="number"
                  className="mb-2 h-10 w-[400px] border pl-2"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
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
              <div className="flex items-center">
                <div className="mr-4 w-[100px]  text-right">
                  ReceiverIdType:
                </div>
                <div className="mx-4">
                  <input
                    type="radio"
                    value={ID_TYPE_CAT_LOOT_HOLDER}
                    checked={receiverIdType === ID_TYPE_CAT_LOOT_HOLDER}
                    onChange={(event) => handleRadioChange(event)}
                  />
                  <label htmlFor="12hour" className="ml-2">
                    Smart Cat/Loot Holder
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    value={ID_TYPE_REDBRICK_WALLET}
                    checked={receiverIdType === ID_TYPE_REDBRICK_WALLET}
                    onChange={(event) => handleRadioChange(event)}
                  />
                  <label htmlFor="12hour" className="ml-2">
                    Redbrick Wallet
                  </label>
                </div>
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
                onClick={() => makeOfferClick()}
                type="button"
                variant="action"
                className="mt-4 h-10"
                disabled={!(approved && address !== undefined && amount > 0)}
              >
                Make offer
                {saleLoading && <SpinLoading />}
              </Button>
              {error && (
                <div className="mb-4  w-[500px] break-words text-left text-red-500 md:w-[400px] lg:w-[700px] ">
                  Error: {error}
                </div>
              )}
              {shareLink && (
                <div className="my-4 w-[500px] break-words text-left md:w-[400px] lg:w-[700px] ">
                  Please share this link to others:
                  <br />{" "}
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
