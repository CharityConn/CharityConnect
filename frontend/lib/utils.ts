import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addressPipe(address: string, start: number = 38) {
  return `${address.slice(0, 6)}...${address.slice(start)}`
}

export function inIframe() {
  try {
    return typeof window !== "undefined" && window.self !== window.top
  } catch (e) {
    return true
  }
}

export function pricePipe(price: string) {
  return `${Number(price) > 0 ? price + " ETH" : "Free"}`
}

export function prepareAttestation(attestation: any) {
  return [
    [
      (attestation as any).domain.name,
      (attestation as any).domain.version,
      (attestation as any).domain.chainId,
      (attestation as any).domain.verifyingContract,
    ],
    [
      (attestation as any).uid,
      (attestation as any).message.version,
      (attestation as any).message.schema,
      (attestation as any).message.recipient,
      (attestation as any).message.time,
      (attestation as any).message.expirationTime,
      (attestation as any).message.refUID,
      (attestation as any).message.revocable,
      (attestation as any).message.data,
    ],
    [
      (attestation as any).signature.v,
      (attestation as any).signature.r,
      (attestation as any).signature.s,
    ],
  ]
}

export function prepareError(error: any) {
  if (error.response && error.response.data) {
    return error.response.data.message
  } else {
    if (
      error.message.indexOf("ACTION_REJECTED") > -1 ||
      error.message.indexOf("rejected") > -1 ||
      error.message.indexOf("denied") > -1
    ) {
      return "User rejected action"
    } else {
      console.log(error.message)
      return "There was an error. Please try again. If the problem persists, please contact support."
    }
  }
}
