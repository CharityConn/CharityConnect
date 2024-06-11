import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .default("development"),
    NEXT_PUBLIC_BACKEND_BASE: z.string().min(1).endsWith("/"),
    NEXT_PUBLIC_JWT: z.string().min(1),
    NEXT_PUBLIC_CHAIN_ID: z
      .string()
      // transform to number
      .transform((s) => parseInt(s, 10))
      // make sure transform worked
      .pipe(z.number()),
    NEXT_PUBLIC_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_ATT_BACKEND_BASE: z.string().min(1).endsWith("/"),
    NEXT_PUBLIC_TSVIEWER: z.string().min(1).endsWith("/"),
    NEXT_PUBLIC_FRONTEND_URL: z.string().min(1).endsWith("/"),
    NEXT_PUBLIC_ATTESTATION_FRONTEND: z
      .string()
      .default("http://localhost:3002/create/email"),
    NEXT_PUBLIC_ATT_CHAIN_ID: z
      .string()
      // transform to number
      .transform((s) => parseInt(s, 10))
      // make sure transform worked
      .pipe(z.number()),
    NEXT_PUBLIC_STORE_URL: z.string().min(1).endsWith("/"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_BACKEND_BASE: process.env.NEXT_PUBLIC_BACKEND_BASE,
    NEXT_PUBLIC_JWT: process.env.NEXT_PUBLIC_JWT,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_ATT_BACKEND_BASE: process.env.NEXT_PUBLIC_ATT_BACKEND_BASE,
    NEXT_PUBLIC_TSVIEWER: process.env.NEXT_PUBLIC_TSVIEWER,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_ATTESTATION_FRONTEND:
      process.env.NEXT_PUBLIC_ATTESTATION_FRONTEND,
    NEXT_PUBLIC_ATT_CHAIN_ID: process.env.NEXT_PUBLIC_ATT_CHAIN_ID,
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
  },
})
