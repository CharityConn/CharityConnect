import axios from "axios"
import { SiweMessage } from "siwe"

import { env } from "@/lib/env.mjs"

const axiosInstance = axios.create({
  baseURL: `${env.NEXT_PUBLIC_BACKEND_BASE}redbrick`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.NEXT_PUBLIC_JWT}`,
  },
})

export function fetchNonce() {
  return axiosInstance.get(`/nonce`).then((v) => v.data)
}

export async function verifyWallet(
  message: string,
  signature: string,
  receiver: string
) {
  return axiosInstance
    .post(
      `/verify-wallet`,
      { message, signature, receiver },
    )
    .then((v) => v.data)
}
