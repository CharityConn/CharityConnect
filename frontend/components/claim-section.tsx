"use client"

import { useCallback, useEffect, useState } from "react"
import { IFrameEthereumProvider } from "@ledgerhq/iframe-provider"
import { ethers } from "ethers"

import {
  DVP_ABI,
  DVP_OFFERCONTRACT_ADDRESS,
  ERC20_ABI,
  ID_TYPE_CAT_LOOT_HOLDER,
  ID_TYPE_REDBRICK_WALLET,
  TOKEN_ABI,
  ZERO_ADDRESS,
} from "@/lib/constants"
import {
  addressPipe,
  prepareAttestation,
  prepareError,
  pricePipe,
} from "@/lib/utils"

import { ErrorSection } from "./error"
import { Loading } from "./loading"
import { SpinLoading } from "./spin-loading"
import { Button } from "./ui/button"
import { CatLootSection } from "./verify/cat-loot-section"
import { RedbrickSection } from "./verify/redbrick-section"

export const ClaimSection = () => {
  const [walletAddress, setWalletAddress] = useState("")
  const [chainId, setChainId] = useState("")
  const [offerAttestation, setOfferAttestation] = useState(null)
  const [idAttestation, setIdAttestation] = useState(null)
  const [erc20, setErc20] = useState("")
  const [token, setToken] = useState("")
  const [amount, setAmount] = useState(0)
  const [claimedByAttestation, setClaimedByAttestation] = useState(0)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [totalClaimable, setTotalClaimable] = useState(0)
  const [price, setPrice] = useState("")
  const [buyBtnHidden, setBuyBtnHidden] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const [approveLoading, setApproveLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState("")
  const [txURL, settxURL] = useState("")
  const [receiver, setReceiver] = useState("")

  const [open, setOpen] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)

  const [receiverIdType, setReceiverIdType] = useState("")
  const [loading, setLoading] = useState(true)
  const [ethereum, setEthereum] = useState<any>(null)

  //todo
  const [brand, setBrand] = useState({
    name: "Redbrick",
    logo: "https://resources.smartlayer.network/images/redbrick/logo.png",
    bgUrl:
      "https://resources.smartlayer.network/images/redbrick/background.png",
    preview:
      "https://resources.smartlayer.network/images/redbrick/preview-square.png",
  })
  const [tokenId, setTokenId] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEthereum(new IFrameEthereumProvider())
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && ethereum) {
      window.addEventListener(
        "message",
        (message) => {
          if (message.data instanceof Object && message.data.attestation) {
            //get saler attestation
            if (message.data.type === "attestation") {
              console.log(
                "$$$!!! setOfferAttestation",
                message.data.attestation
              )
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
            console.log("##############")
            setErc20(message.data.erc20)
            setToken(message.data.token)
            setAmount(Number(message.data.amount))
            setPrice(ethers.formatEther(message.data.price.toString()))
            setReceiverIdType(message.data.receiverIdType)
            setLoading(false)
          }
        },
        false
      )
      ethereum.send("page_ready")
    }
  }, [ethereum, walletAddress])

  useEffect(() => {
    async function isClaimed() {
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: token,
        abi: TOKEN_ABI,
        data: [receiver],
        function: "claimedById",
        provider: "provider",
      })
      const result = await ethereum.send("eth_call", [
        {
          from: walletAddress,
          to: token,
          data: encodeData,
        },
      ])
      setIsClaimed(result > 0)
    }
    if (token && receiver && walletAddress) {
      isClaimed()
    }
  }, [token, receiver, ethereum, walletAddress, receiverIdType])

  useEffect(() => {
    if (
      [ID_TYPE_REDBRICK_WALLET, ID_TYPE_CAT_LOOT_HOLDER].includes(
        receiverIdType
      )
    ) {
      setReceiver(walletAddress)
    }
  }, [receiverIdType, walletAddress])

  useEffect(() => {
    async function getClaimedByAttestation(uid: string) {
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: token,
        abi: TOKEN_ABI,
        data: [uid],
        function: "claimedByUid",
        provider: "provider",
      })

      const result = await ethereum.send("eth_call", [
        {
          from: walletAddress,
          to: token,
          data: encodeData,
        },
      ])
      console.log(
        "getClaimedByAttestation",
        (offerAttestation as any).uid,
        result,
        Number(result) > 0
      )
      setClaimedByAttestation(Number(result))
    }
    if (
      token &&
      receiver &&
      walletAddress &&
      offerAttestation &&
      (offerAttestation as any).uid
    ) {
      getClaimedByAttestation((offerAttestation as any).uid)
    }
  }, [token, receiver, ethereum, walletAddress, offerAttestation])

  useEffect(() => {
    async function getTotalClaimed() {
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: token,
        abi: TOKEN_ABI,
        data: [],
        function: "claimed",
        provider: "provider",
      })

      const result = await ethereum.send("eth_call", [
        {
          from: walletAddress,
          to: token,
          data: encodeData,
        },
      ])
      console.log("getTotalClaimed", result)
      setTotalClaimed(Number(result))
    }
    if (token && walletAddress) {
      getTotalClaimed()
    }
  }, [token, ethereum, walletAddress])

  useEffect(() => {
    async function getTotalClaimable() {
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: token,
        abi: TOKEN_ABI,
        data: [],
        function: "totalClaimable",
        provider: "provider",
      })

      const result = await ethereum.send("eth_call", [
        {
          from: walletAddress,
          to: token,
          data: encodeData,
        },
      ])
      console.log("getTotalClaimable", result)
      setTotalClaimable(Number(result))
    }
    if (token && walletAddress) {
      getTotalClaimable()
    }
  }, [token, ethereum, walletAddress])

  useEffect(() => {
    const getWallet = async () => {
      setWalletAddress((await ethereum.send("eth_accounts", []))[0].address)
    }

    const getChain = async () => {
      const connectedNetwork = await ethereum.send("net_version")
      // Redbrick does not support sepolia, so workaround by using Mumbai in testnet
      setChainId(connectedNetwork === "11155111" ? "80001" : connectedNetwork)
    }

    if (ethereum && !walletAddress) {
      getWallet()
      getChain()
    }
  }, [walletAddress, ethereum, receiverIdType])

  //todo

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
      console.log(erc20Address, owner, DVP_OFFERCONTRACT_ADDRESS)
      const encodeData = await ethereum.send("eth_encodeData", {
        contract: erc20Address,
        abi: ERC20_ABI,
        data: [owner, DVP_OFFERCONTRACT_ADDRESS],
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
        DVP_OFFERCONTRACT_ADDRESS,
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

  const buyHandler = async () => {
    try {
      setError("")
      if (offerAttestation && idAttestation) {
        setBuyLoading(true)
        const offerAttestationValue = prepareAttestation(offerAttestation)

        const idAttestationValue = prepareAttestation(idAttestation)

        console.log("offer--", offerAttestationValue)
        console.log("id---", idAttestationValue)

        const baseFee = await ethereum.send("eth_getBaseFeePerGas", [])
        console.log("baseFee--", baseFee)
        let feePriority = BigInt(10 * 1000_000_000)

        if (baseFee && (baseFee * BigInt(13)) / BigInt(100) >= feePriority) {
          feePriority = (baseFee * BigInt(13)) / BigInt(100)
        }
        // // 20 GWEI
        const maxGasPrice = 20 * 1000_000_000
        console.log(
          feePriority,
          maxGasPrice,
          ethers.toBeHex(feePriority),
          ethers.toBeHex(maxGasPrice)
        )

        let txHash

        if (erc20 === ZERO_ADDRESS) {
          const encodeData = await ethereum.send("eth_encodeData", {
            contract: DVP_OFFERCONTRACT_ADDRESS,
            abi: DVP_ABI,
            data: [offerAttestationValue, idAttestationValue],
            function: "perform",
          })

          txHash = await ethereum.send("eth_sendTransaction", [
            {
              from: walletAddress,
              to: DVP_OFFERCONTRACT_ADDRESS,
              data: encodeData,
              value: ethers.toBeHex(ethers.parseUnits(price, 18).toString()),
              gasLimit: ethers.toBeHex(6000000),
              //   maxPriorityFeePerGas: ethers.toBeHex(feePriority),
              //   maxFeePerGas: ethers.toBeHex(maxGasPrice),
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

        console.log(
          "succeess!!!!",
          "https://mumbai.polygonscan.com/tx/" + txHash
        )
        detectTransaction(txHash)
      }
    } catch (e: any) {
      console.log("error--", e)
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
        console.log(
          transaction.status > 0,
          transaction.status === 0,
          transaction.status < 0
        )
        if (Number(transaction.status) === 0) {
          setError("The transaction is failure!")
        } else {
          await decodeTokenId(transaction)
          settxURL(`https://sepolia.etherscan.io/tx/${txHash}`)
        }

        setBuyLoading(false)
        clearInterval(timer)
      } catch (e) {
        console.log(e)
      }
    }, 1000)
  }

  const decodeTokenId = async (transaction: any) => {
    transaction.logs.forEach(async (el: any) => {
      if (
        el.topics.length === 4 &&
        el.address.toLowerCase() === token.toLowerCase()
      ) {
        try {
          const decodedParameters = await ethereum.send("eth_decodeEventLog", {
            contract: el.address,
            abi: TOKEN_ABI,
            data: [el.data, el.topics],
            function: "Transfer",
            provider: "provider",
          })
          const values = decodedParameters.split(",")

          console.log(decodedParameters, values)

          setTokenId(values[2])
        } catch (error) {
          console.log(error)
        }
      }
    })
  }

  const handleOnSetIdAttestation = useCallback((att: any) => {
    console.log(att)
    setIdAttestation(att)
    setBuyBtnHidden(false)
  }, [])

  const handleOnSetError = useCallback((error: string) => {
    setError(error)
  }, [])

  const handleOnSetReceiver = useCallback((receiver: string) => {
    setReceiver(receiver)
  }, [])

  const handleOnChangeAccount = useCallback(async () => {
    const result = await ethereum.send("eth_requestAccounts")
    console.log("change account", result)
  }, [ethereum])

  const exploreHandler = () => {
    //todo, need change to lanchpad
    window.open(txURL, "blank")
  }

  const hasExceededLimit =
    (totalClaimable > 0 && totalClaimed >= totalClaimable) || // Total limit
    (claimedByAttestation > 0 && claimedByAttestation >= amount) // Per attestation limit

  let claimValidationError = ""
  if (isClaimed) {
    claimValidationError = "This account has claimed"
  } else if (hasExceededLimit) {
    claimValidationError = "This claim has been finished"
  }

  const isDisabled = isClaimed || hasExceededLimit

  return (
    <div
      style={{
        backgroundImage: `url(${brand.bgUrl})`,
        backgroundPosition: "center",
      }}
      className="min-h-screen  bg-cover bg-no-repeat"
    >
      <div className="container mt-8  flex flex-1  flex-col items-center rounded-2xl border bg-[#FAFAFA]  px-10 py-8 text-center lg:w-[520px]">
        <div>
          <img src={brand.logo} className="mx-auto my-4 w-[140px]"></img>

          {loading && (
            <>
              <Loading className="mx-auto my-20" />
            </>
          )}

          <div className={txURL !== "" ? "hidden" : ""}>
            <div>
              {receiverIdType === ID_TYPE_REDBRICK_WALLET && (
                <RedbrickSection
                  walletAddress={walletAddress}
                  chainId={chainId}
                  isDisabled={isDisabled}
                  brand={brand}
                  ethereum={ethereum}
                  onSetIdAttestation={handleOnSetIdAttestation}
                  onSetError={handleOnSetError}
                  onSetReceiver={handleOnSetReceiver}
                />
              )}
              {receiverIdType === ID_TYPE_CAT_LOOT_HOLDER && (
                <CatLootSection
                  walletAddress={walletAddress}
                  chainId={chainId}
                  isDisabled={isDisabled}
                  ethereum={ethereum}
                  onSetIdAttestation={handleOnSetIdAttestation}
                  onSetError={handleOnSetError}
                  onSetReceiver={handleOnSetReceiver}
                />
              )}

              {claimValidationError && (
                <ErrorSection
                  error={claimValidationError}
                  onChangeAccount={handleOnChangeAccount}
                />
              )}
            </div>

            <div className={buyBtnHidden ? "hidden" : "mt-4 text-center"}>
              <div className="font-bold">Price:</div>
              {pricePipe(price)}
              <img src={brand.preview} className="w-[184px] mx-auto mt-2" />
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  type="button"
                  variant="action"
                  className="mt-4 h-12 w-[185px]"
                  onClick={() => buyHandler()}
                  disabled={buyLoading}
                >
                  {buyLoading && <SpinLoading />}{" "}
                  {!buyLoading && <>Claim Token</>}
                </Button>
              </div>
            </div>
            {error && (
              <>
                <ErrorSection
                  error={error}
                  onChangeAccount={handleOnChangeAccount}
                />
              </>
            )}
          </div>
        </div>
        <div className={(txURL === "" ? "hidden" : "") + " mt-4  break-words"}>
          <img src="./images/check.svg" className="mx-auto mb-4" />
          <div className="mb-2 font-sans font-bold">
            Achievement Token successfully claimed!
          </div>
          <div className="max-w-[375px] mx-auto">
            Start exploring the benefits of your new Achievement Token
          </div>
          <div className="mx-auto mt-4 w-[245px] rounded-lg shadow-lg">
            <img src={brand.preview} />
            <div className="px-4  py-2 text-left">
              <div className="mb-1 font-sans text-[13px] font-bold">
                REDBRICK ACHIEVEMENT TOKEN
              </div>
              <div className="mb-2 flex text-xs">
                Redbrick#
                {addressPipe(tokenId, 71)}{" "}
                <img src="./images/verified.svg" className="ml-2" />
              </div>
            </div>
          </div>
          <div className="my-4 flex rounded-lg border border-[#001AFF] bg-[#EAEFFF] p-2 text-left max-w-[424px] mx-auto">
            <img src="./images/info.svg" className="mr-2" />
            You will be able to claim $SLN APR when remaining tokens are minted
          </div>
          <Button
            type="button"
            variant="action"
            className="h-12"
            onClick={() => exploreHandler()}
          >
            Explore your Token
          </Button>
        </div>
      </div>
    </div>
  )
}
