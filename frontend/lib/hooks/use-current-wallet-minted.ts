import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

export const useCurrentWalletMinted = () => {
  const { address } = useAccount()
  const [currentAddressHasMinted, setCurrentAddressHasMinted] = useState(false)

  useEffect(() => {
    setCurrentAddressHasMinted(false)
    if (address) {
    }
  }, [address])

  if (!address) {
    return false
  }

  return currentAddressHasMinted
}
