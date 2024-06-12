import BigNumber from "bignumber.js"
import { ethers } from "ethers"

import {
  DVP_CONTRACT_ADDRESS,
  DVP_OFFERCONTRACT_ADDRESS,
  EAS_ADDRESS,
} from "./constants"
import { env } from "./env.mjs"

export const ERC721_ABI = [
  "function approve(address, uint256) external returns (bool)", //to, tokenId
  "function setApprovalForAll(address, bool) external", //operator, approved
  "function isApprovedForAll(address, address) external view returns (bool)", //owner, operator
  "function getApproved(uint256) external view returns (address)", //tokenId
  "function burn(uint256) payable public ", //tokenId
]

export const ERC20_ABI = [
  "function approve(address, uint256) external returns (bool)", //spender, value
  "function allowance(address, address) external view returns (uint256)", //owner, spender, output: allowance
  "function decimals() external pure returns (uint8)",
]

export let provider: ethers.BrowserProvider
if (typeof window !== "undefined" && window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum)
}

export function hasMetaMask() {
  return !!window.ethereum
}

export async function signAttestation(offer: any) {
  const signer = await provider.getSigner()

  const domain = {
    name: "Smart-Layer-Attestation-Service",
    chainId: env.NEXT_PUBLIC_CHAIN_ID,
    version: "0.1",
    verifyingContract: DVP_CONTRACT_ADDRESS,
  }

  const types = {
    Offer: [
      { name: "token", type: "address" },
      { name: "id", type: "uint256" },
      { name: "receiverIdType", type: "string" },
      { name: "receiver", type: "string" },
      { name: "erc20", type: "address" },
      { name: "price", type: "uint256" },
    ],
  }

  console.log(domain, types, offer)

  return await signer.signTypedData(domain, types, offer)
}

const errorMsg = "please connect a wallet first."
const rpcProvider = new ethers.JsonRpcProvider('https://base-sepolia.blockpi.network/v1/rpc/public')

export const CONFIRMATIONS = 1

export async function isApproved(
  erc721Address: string,
  tokenId: string,
  owner: string
) {
  if (!provider) {
    console.error(errorMsg)
    return
  }
  console.log(erc721Address)
  const erc721Contract = new ethers.Contract(
    erc721Address,
    ERC721_ABI,
    provider
  )

  try {
    return await erc721Contract.isApprovedForAll(owner, DVP_CONTRACT_ADDRESS)
  } catch (error) {
    console.error("isApprovedForAll failed, try getApproved function")

    return (
      (await erc721Contract.getApproved(tokenId)).toLowerCase() ===
      DVP_CONTRACT_ADDRESS.toLowerCase()
    )
  }
}

export async function approve(
  erc721Address: string,
  tokenId: string,
  committedHandler: any,
  mintedHandler: any
) {
  if (!rpcProvider) {
    console.error(errorMsg)
    return
  }
  const signer = await provider.getSigner()
  const erc721Contract = new ethers.Contract(erc721Address, ERC721_ABI, signer)
  let tx
  try {
    tx = await erc721Contract.setApprovalForAll(DVP_CONTRACT_ADDRESS, tokenId, {
      gasLimit: 6000000,
    })
  } catch (error) {
    console.log(error)
    console.error("setApprovalForAll failed, try approve function.")

    tx = await erc721Contract.approve(DVP_CONTRACT_ADDRESS, tokenId, {
      gasLimit: 6000000,
    })
  }
  console.log(tx)

  committedHandler(tx)

  if (mintedHandler) {
    mintedHandler(await provider.waitForTransaction(tx.hash, CONFIRMATIONS))
  }
}

export async function erc20Allowance(erc20Address: string, owner: string) {
  const erc721Contract = new ethers.Contract(erc20Address, ERC20_ABI, provider)

  try {
    return await erc721Contract.allowance(owner, DVP_CONTRACT_ADDRESS)
  } catch (error) {
    console.error("get allowance failed")
    return null
  }
}

export async function approveERC20(
  erc20Address: string,
  amount: number,
  committedHandler: any
) {
  const signer = await provider.getSigner()
  const erc20Contract = new ethers.Contract(erc20Address, ERC20_ABI, signer)

  try {
    const tx = await erc20Contract.approve(DVP_CONTRACT_ADDRESS, amount, {
      gasLimit: 6000000,
    })
    await tx.wait()
    if (committedHandler) committedHandler(tx)
  } catch (error) {
    console.error("Approve erc20 failed.", error)
  }
}

async function executeContractMethodWithEstimatedGas(
  contract: any,
  functionName: string,
  args: any
) {
  console.log(contract.estimateGas)
  //   const estimatedGas = new BigNumber(
  //     ethersOf(
  //       await contract.estimateGas[functionName](...args)
  //         .then((value: any) => {
  //           const minimumGas = BigInt("55000")
  //           if (value.lt(minimumGas)) {
  //             return minimumGas
  //           }
  //           return value
  //         })
  //         .catch((err: any) => {
  //           return BigInt("650000")
  //         })
  //     )
  //   )
  const argsForOverridden = args.pop()
  argsForOverridden.gasLimit = 650000 //parseEthers(estimatedGas.times(1.2).toString())
  args.push(argsForOverridden)
  return contract.connect(getSigner())[functionName](...args)
}

export function ethersOf(amount: any) {
  return ethers.formatEther(amount)
}

const ETHER_DECIMALS = 18
export function parseEthers(amount: string) {
  return parseUnits(amount, ETHER_DECIMALS)
}

export function parseUnits(amount: string, unit: number) {
  const bnAmount = new BigNumber(amount)
  try {
    return ethers.parseUnits(bnAmount.toFixed(unit), unit)
  } catch (e) {
    return BigInt(bnAmount.times(Math.pow(10, unit)).toFixed(0))
  }
}

function getSigner() {
  if (!provider) {
    console.error(errorMsg)
    return
  }

  return provider.getSigner()
}

export async function getDecimals(erc20: string) {
  return await new ethers.Contract(erc20, ERC20_ABI, provider).decimals()
}

export async function approveForClaim(
  erc721Address: string,
  committedHandler: any,
  mintedHandler: any
) {
  if (!rpcProvider) {
    console.error(errorMsg)
    return
  }
  const signer = await provider.getSigner()
  const erc721Contract = new ethers.Contract(erc721Address, ERC721_ABI, signer)
  let tx
  try {
    tx = await erc721Contract.setApprovalForAll(DVP_OFFERCONTRACT_ADDRESS, {
      gasLimit: 6000000,
    })
  } catch (error) {
    console.log(error)
    console.error("setApprovalForAll failed, try approve function.")

    tx = await erc721Contract.approve(DVP_OFFERCONTRACT_ADDRESS, {
      gasLimit: 6000000,
    })
  }
  console.log(tx)

  committedHandler(tx)

  if (mintedHandler) {
    mintedHandler(await provider.waitForTransaction(tx.hash, CONFIRMATIONS))
  }
}

export async function isApprovedForClaim(erc721Address: string, owner: string) {
  //todo
  //   if (!provider) {
  //     console.error(errorMsg)
  //     return
  //   }

  //   const erc721Contract = new ethers.Contract(
  //     erc721Address,
  //     ERC721_ABI,
  //     provider
  //   )

  //   try {
  //     return await erc721Contract.isApprovedForAll(
  //       owner,
  //       DVP_OFFERCONTRACT_ADDRESS
  //     )
  //   } catch (error) {
  //     console.error("isApprovedForAll failed, try getApproved function")

  //     return (
  //       (
  //         await erc721Contract.getApproved(DVP_OFFERCONTRACT_ADDRESS)
  //       ).toLowerCase() === DVP_OFFERCONTRACT_ADDRESS.toLowerCase()
  //     )
  //   }
  return true
}

export async function signAttestationForClaim(offer: any) {
  const signer = await provider.getSigner()

  const domain = {
    name: "EAS Attestation",
    chainId: env.NEXT_PUBLIC_CHAIN_ID,
    version: "1.2.0",
    verifyingContract: DVP_OFFERCONTRACT_ADDRESS,
  }
  console.log(domain)

  const types = {
    Offer: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "receiverIdType", type: "string" },
      { name: "erc20", type: "address" },
      { name: "price", type: "uint256" },
    ],
  }

  console.log(domain, types, offer)

  return await signer.signTypedData(domain, types, offer)
}
