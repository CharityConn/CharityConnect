"use client"

import {
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export type BuyerVerifyDialogRef = {
  open: () => void
}
interface BuyerVerfiyDialogProps {
  children?: ReactNode
}

export const BuyerVerifyDialog = forwardRef<
  BuyerVerifyDialogRef,
  BuyerVerfiyDialogProps
>(function GetPassDialogCore({ children }, ref) {
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      open: () => setOpen(true),
    }
  })

  useEffect(() => {
    if (!open) {
      setError("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 rounded-3xl rounded-b-none p-4 pt-14 sm:max-w-md sm:rounded-3xl sm:p-8">
        dddd
      </DialogContent>
    </Dialog>
  )
})
