"use client"

import { useEffect, useRef, useState } from "react"
import { IFrameEthereumProvider } from "@ledgerhq/iframe-provider"
import axios from "axios"
import { ethers } from "ethers"

import { createSiweMessage, siwe } from "@/lib/api"
import { ERC20_ABI } from "@/lib/constants"
import { env } from "@/lib/env.mjs"
import { cn, inIframe, prepareError } from "@/lib/utils"

import { BuyerVerifyDialog, BuyerVerifyDialogRef } from "./buyer-verify-dialog"
import { Loading } from "./loading"
import { SpinLoading } from "./spin-loading"
import { Dialog, DialogContent } from "./ui/dialog"

export const BuyerSection = () => {
  const modalRef = useRef<BuyerVerifyDialogRef>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const [chainId, setChainId] = useState("")
  const [offerAttestation, setOfferAttestation] = useState(null)
  const [idAttestation, setIdAttestation] = useState(null)
  const [email, setEmail] = useState("")
  const [erc20, setErc20] = useState("")
  const [token, setToken] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [OtpBtnDisabled, setOtpBtnDisabled] = useState(false)
  const [OtpBtnText, setOtpBtnText] = useState("Send Otp Code")
  const [verifyBtnHidden, setVerifyBtnHidden] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [buyBtnHidden, setBuyBtnHidden] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState("")
  const [txURL, settxURL] = useState("")
  const [open, setOpen] = useState(false)

  const attestationSite = new URL(env.NEXT_PUBLIC_ATTESTATION_FRONTEND).origin //"http://localhost:3002"
  console.log("attestationSite--", attestationSite)

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    console.log(typeof window !== "undefined")
    if (typeof window !== "undefined") {
      window.addEventListener(
        "message",
        (message) => {
          if (message.data instanceof Object && message.data.attestation) {
            //get saler attestation
            if (message.data.type === "attestation") {
              setOfferAttestation(message.data.attestation)
            } else if (message.data.type === "id-att") {
              //get id attestation
              console.log("id Atttestation", message.data.attestation)
              setIdAttestation(message.data.attestation)
              setOpen(message.data.display)
              setBuyBtnHidden(false)
            }
          }

          //get offer info
          if (message.data instanceof Object && message.data.token) {
            setEmail(message.data.receiver)
            setErc20(message.data.erc20)
            setToken(message.data.token)
            setTokenId(message.data.id.toString())
            setPrice(ethers.formatEther(message.data.price.toString()))
          }

          //call idattestation iframe
          if (message.data.ready) {
            const option = { email: email }
            let attestationFrame = document.getElementById("attIframe")
            sendMessage(attestationFrame, option)
          }
        },
        false
      )
    }
    function sendMessage(iframe: any, option: any) {
      let iframeWin = iframe.contentWindow
      iframeWin.postMessage(option, attestationSite)
    }
  }, [attestationSite, email])

  let ethereum: any

  useEffect(() => {
    async function getMetadata() {
      const result = await axios.get(
        `https://resources.smarttokenlabs.com/${chainId}/${token.toLowerCase()}/${tokenId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      setImage(result.data.image)
    }
    //load image
    if (chainId && token && tokenId) {
      getMetadata()
    }
  }, [chainId, token, tokenId])

  useEffect(() => {
    const getWallet = async () => {
      console.log("######## send")
      setWalletAddress((await ethereum.send("eth_accounts", []))[0].address)
    }

    const getChain = async () => {
      setChainId(await ethereum.send("net_version"))
    }

    if (ethereum && !walletAddress) {
      getWallet()
      getChain()
    }
  }, [walletAddress, ethereum])

  if (inIframe()) {
    ethereum = new IFrameEthereumProvider()

    console.log("I'm in iframe")
  } else {
    console.log("no in iframe")
  }

  const baseURL = "http://localhost:3206"
  const DVP_CONTRACT_ADDRESS = "0xE7c7cC7b540Ad0095B694D7500BA84753E41182f"
  const DVP_ABI = [
    "function perform( tuple(tuple( string ,string , uint256 ,address),tuple( bytes32 ,uint16 ,bytes32 , address,uint64 , uint64 ,bytes32 ,bool,bytes),tuple(uint8 ,bytes32 ,bytes32 ))  , tuple(tuple( string ,string , uint256 ,address),tuple( bytes32 ,uint16 ,bytes32 , address,uint64 , uint64 ,bytes32 ,bool,bytes),tuple(uint8 ,bytes32 ,bytes32 ))) external payable",
  ]

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  const approveHandler = async () => {
    //const allowance = await erc20Allowance(erc20, walletAddress)

    // if (allowance) {
    //   console.log(allowance, parseInt(allowance), price, Number(price))
    //   console.log("need ")
    // }
    setApproveLoading(true)

    const txHash = await approveERC20(ZERO_ADDRESS, price)
    console.log("txHash---", txHash)
    const timer = setInterval(async () => {
      try {
        const transaction = await ethereum.send("eth_getTransactionReceipt", [
          txHash,
        ])
        console.log(transaction)

        setApproveLoading(false)
        setApproved(true)
        clearInterval(timer)
      } catch (e) {
        console.log(e)
      }
    }, 1000)
  }

  async function erc20Allowance(erc20Address: string, owner: string) {
    try {
      console.log(erc20Address, owner, DVP_CONTRACT_ADDRESS)
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: erc20Address,
        abi: ERC20_ABI,
        data: [owner, DVP_CONTRACT_ADDRESS],
        function: "allowance",
        provider: "provider",
      })

      const result = await ethereum.send("eth_call", [
        {
          from: owner,
          to: erc20Address,
          data: encodeData,
        },
      ])
      console.log(result, parseInt(result))
    } catch (error) {
      console.log(error)
      console.error("get allowance failed")
      return null
    }
  }

  async function approveERC20(erc20Address: string, amount: string) {
    const encodeData = await ethereum.send("eth_encodeData", {
      contract: erc20Address,
      abi: ERC20_ABI,
      data: [
        DVP_CONTRACT_ADDRESS,
        ethers.toBeHex(ethers.parseUnits(amount, 18).toString()),
      ],
      function: "approve",
    })
    const result = await ethereum.send("eth_sendTransaction", [
      {
        from: walletAddress,
        to: erc20Address,
        data: encodeData,
        gasLimit: ethers.toBeHex(6000000),
      },
    ])

    console.log(result)
    return result
  }

  const verifyHandler = async () => {
    try {
      console.log("verify---", new Date())
      setVerifyLoading(true)
      setBuyBtnHidden(true)
      setError("")

      setOpen(true)
    } catch (e: any) {
      setError(prepareError(e))
    } finally {
      setVerifyLoading(false)
    }
  }

  const buyHandler = async () => {
    try {
      setBuyLoading(true)
      setError("")
      console.log("offerAttestation", offerAttestation)
      console.log("idAttestation", idAttestation)
      if (offerAttestation && idAttestation) {
        const offerAttestationValue = [
          [
            (offerAttestation as any).domain.name,
            (offerAttestation as any).domain.version,
            (offerAttestation as any).domain.chainId,
            (offerAttestation as any).domain.verifyingContract,
          ],
          [
            (offerAttestation as any).uid,
            (offerAttestation as any).message.version,
            (offerAttestation as any).message.schema,
            (offerAttestation as any).message.recipient,
            (offerAttestation as any).message.time,
            (offerAttestation as any).message.expirationTime,
            (offerAttestation as any).message.refUID,
            (offerAttestation as any).message.revocable,
            (offerAttestation as any).message.data,
          ],
          [
            (offerAttestation as any).signature.v,
            (offerAttestation as any).signature.r,
            (offerAttestation as any).signature.s,
          ],
        ]

        const idAttestationValue = [
          [
            (idAttestation as any).domain.name,
            (idAttestation as any).domain.version,
            (idAttestation as any).domain.chainId,
            (idAttestation as any).domain.verifyingContract,
          ],
          [
            (idAttestation as any).uid,
            (idAttestation as any).message.version,
            (idAttestation as any).message.schema,
            (idAttestation as any).message.recipient,
            (idAttestation as any).message.time,
            (idAttestation as any).message.expirationTime,
            (idAttestation as any).message.refUID,
            (idAttestation as any).message.revocable,
            (idAttestation as any).message.data,
          ],
          [
            (idAttestation as any).signature.v,
            (idAttestation as any).signature.r,
            (idAttestation as any).signature.s,
          ],
        ]

        console.log("offer--", offerAttestationValue)
        console.log("id---", idAttestationValue)

        const baseFee = await ethereum.send("eth_getBaseFeePerGas", [])
        console.log("baseFee--", baseFee)
        let feePriority = BigInt(10 * 1000_000_000)

        if (baseFee && (baseFee * BigInt(13)) / BigInt(100) >= feePriority) {
          feePriority = (baseFee * BigInt(13)) / BigInt(100)
        }
        // // 200 GWEI
        const maxGasPrice = 20 * 1000_000_000

        let txHash

        if (erc20 === ZERO_ADDRESS) {
          const encodeData = await ethereum.send("eth_encodeData", {
            contract: DVP_CONTRACT_ADDRESS,
            abi: DVP_ABI,
            data: [offerAttestationValue, idAttestationValue],
            function: "perform",
          })

          console.log({
            gasLimit: 600000,
            maxPriorityFeePerGas: feePriority,
            maxFeePerGas: maxGasPrice,
          })
          txHash = await ethereum.send("eth_sendTransaction", [
            {
              from: walletAddress,
              to: DVP_CONTRACT_ADDRESS,
              data: encodeData,
              value: ethers.toBeHex(ethers.parseUnits(price, 18).toString()),
              gasLimit: ethers.toBeHex(600000),
              maxPriorityFeePerGas: ethers.toBeHex(feePriority),
              maxFeePerGas: ethers.toBeHex(maxGasPrice),
            },
          ])

          console.log(txHash)
        } else {
          //   ts = await dvpContract.perform(offerAttestation, idAttestation, {
          //     gasLimit: 6000000,
          //     maxPriorityFeePerGas: feePriority,
          //     maxFeePerGas: maxGasPrice,
          //   })
        }

        // console.log("###", tx.hash)

        // await tx.wait()

        console.log(
          "succeess!!!!",
          "https://mumbai.polygonscan.com/tx/" + txHash
        )
        detectTransaction(txHash)
      }
    } catch (e: any) {
      setError(prepareError(e))
      setBuyLoading(false)
    }
  }

  const detectTransaction = async (txHash: string) => {
    const timer = setInterval(async () => {
      try {
        const transaction = await ethereum.send("eth_getTransactionReceipt", [
          txHash,
        ])
        console.log(transaction)
        settxURL(`https://mumbai.polygonscan.com/tx/${txHash}`)
        setBuyLoading(false)
        clearInterval(timer)
      } catch (e) {
        console.log(e)
      }
    }, 1000)
  }

  //   const siweHandler = async () => {
  //     const message = await createSiweMessage(
  //       walletAddress,
  //       "Sign in with Ethereum to the app."
  //     )
  //     const signature = await ethereum.send("personal_sign", [
  //       message.prepareMessage(),
  //       walletAddress.toLowerCase(),
  //     ])

  //     await siwe(message, signature)
  //   }

  return (
    <>
      <div className="">
        <div>
          <div>
            Your wallet is: {walletAddress} in {chainId}
          </div>
          <div>
            Your email is: {email}
            <br />
            Price is: {price} ETH
          </div>
          <div className="mx-auto my-4 w-40 text-center">
            {!image && (
              <>
                <Loading className="mx-auto" />
              </>
            )}
            {image && (
              <>
                <img src={image} id="image" alt="preview" className="mx-auto" />
                <a
                  href={`https://testnets.opensea.io/assets/mumbai/${token}/${tokenId}`}
                  target="_blank"
                  className="mx-auto mt-4 w-40 text-center underline"
                >
                  Details
                </a>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="hover:bg-Indigo-400 inline-flex h-12 w-40 items-center justify-center rounded-lg border  bg-blue-400 px-4 py-2 text-lg font-medium  text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => verifyHandler()}
            >
              {verifyLoading && <SpinLoading />} {!verifyLoading && <>Verify</>}
            </button>
          </div>
          <div
            className={buyBtnHidden ? "hidden" : "mt-4 text-center"}
            id="buyDiv"
          >
            Congratulation, Your have verified successfully! <br />
            Do you wanto buy?
            <br />
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="hover:bg-Indigo-400 inline-flex h-12 w-40 items-center justify-center  rounded-lg border bg-blue-400 px-4 py-2 text-lg font-medium  text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={approved || approveLoading}
                onClick={() => approveHandler()}
              >
                {approveLoading && <SpinLoading />}
                {!approveLoading && <>Approve</>}
              </button>
              <button
                id="buyButton"
                className="hover:bg-Indigo-400 inline-flex h-12 w-40 items-center justify-center  rounded-lg border bg-blue-400 px-4 py-2 text-lg font-medium  text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => buyHandler()}
                disabled={buyLoading}
              >
                {buyLoading && <SpinLoading />} {!buyLoading && <>Buy</>}
              </button>
            </div>
          </div>
          <div
            className={(txURL === "" ? "hidden" : "") + " mt-4  break-words"}
          >
            Please visit to check the transaction:{" "}
            <a href={txURL} className="cursor underline" target="_blank">
              View the transaction
            </a>
          </div>
          {error && <div className="mt-4 text-red-500">Error:{error}</div>}
        </div>
      </div>
      {/* <BuyerVerifyDialog ref={modalRef} /> */}
      <Dialog open={open} onOpenChange={setOpen}>
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
