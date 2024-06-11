"use client"

import { Button } from "@/components/ui/button"

import { ButtonLoading } from "./button-loading"

interface ImportAttestationButtonProps {
  className?: string
  children?: string
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  variant?: "action" | "outline-white"
}
export const ImportAttestationButton = (
  props: ImportAttestationButtonProps
) => {
  const disabled = props.disabled || props.loading

  return (
    <>
      <Button
        onClick={props.onClick}
        variant={props.variant}
        className={props.className}
        disabled={disabled}
      >
        {props.children}
        <div className="absolute right-10 top-[26px] -translate-y-1/2">
          {props.loading && <ButtonLoading />}
        </div>
      </Button>
    </>
  )
}
