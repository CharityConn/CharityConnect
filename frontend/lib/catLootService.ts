import axios from "axios"

import { env } from "@/lib/env.mjs"

const axiosInstance = axios.create({
  baseURL: `${env.NEXT_PUBLIC_BACKEND_BASE}cat-loot`,
})

export async function verifyWallet(
  message: string,
  signature: string,
  receiver: string
) {
  return axiosInstance
    .post(
      `/verify-wallet`,
      { message, signature, receiver },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
    .then((v) => v.data)
}
