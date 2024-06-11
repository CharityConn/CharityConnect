"use client"

import { NOT_FOUND } from "@/lib/constants"

interface errorProps {
  error: string
  onChangeAccount: () => void
}
export const ErrorSection = (props: errorProps) => {
  const error = props.error
  const onChangeAccount = props.onChangeAccount
  return (
    <div className="mx-auto mt-4  w-[343px]  rounded-lg border border-[#D93F45] p-4">
      <div className="flex justify-center">
        <img src="./images/error.svg" className="mr-2" />
        {error}
      </div>

      {error === NOT_FOUND && (
        <>
          <div
            onClick={onChangeAccount}
            className="cursor-pointer text-[#001AFF] underline"
          >
            Switch wallet
          </div>
        </>
      )}
    </div>
  )
}
