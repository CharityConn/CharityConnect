import { atom } from "jotai"

import { EasAttestations } from "@/lib/types"

export const easAttestationsAtom = atom<EasAttestations>([])
export const getEasAttestationsAtom = atom((get) => get(easAttestationsAtom))

export const setEasAttestationsAtom = atom(
  null,
  async (get, set, address: string | undefined) => {
    if (address) {
      try {
      } catch (e: any) {
        console.log(e.response.data)
        if (e.response.data && e.response.data.message === "not found") {
          set(easAttestationsAtom, [])
        }
      }
    }
  }
)
