import axios from "axios"
import { SiweMessage } from "siwe"

import { env } from "@/lib/env.mjs"

import { scriptURI } from "./constants"
import { IDData } from "./types"

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_BASE,
  headers: { Authorization: `Bearer ${env.NEXT_PUBLIC_JWT}` },
})

export function fetchNonce() {
  return axiosInstance
    .get(`/nonce`, { withCredentials: true })
    .then((v) => v.data)
}

export async function createSiweMessage(address: string, statement: string) {
  const nonce = (await fetchNonce()).nonce
  return new SiweMessage({
    domain: window.location.host,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce,
  })
}

export async function siwe(message: SiweMessage, signature: string) {
  return axiosInstance
    .post(
      "/sign-in",
      {
        message,
        signature,
      },
      { withCredentials: true }
    )
    .then((v) => v.data)
}

export async function createIdAttestation(
  data: IDData,
  signature: string,
  expireTime: number,
  receiver: string
) {
  try {
    let instance = axiosInstance
    const result = await instance.post(
      "attestations/id",
      {
        id: data,
        signature: signature,
        idSignature: signature,
        scriptURI: scriptURI,
        expireTime: Number(expireTime),
        receiver,
      },
      {
        withCredentials: true,
      }
    )

    return result.data
  } catch (e: any) {
    if (e.response?.status === 401) {
      return {
        error:
          e.response.data && e.response.data.message
            ? e.response.data.message
            : "Unauthorized",
      }
    } else {
      return {
        error: e.message,
      }
    }
  }
}
