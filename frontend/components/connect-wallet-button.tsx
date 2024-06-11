import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Button } from "@/components/ui/button"

export const ConnectWalletButton = ({ className, wapperClassName }: { className?: string, wapperClassName?: string }) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className={wapperClassName}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    type="button"
                    className={className}
                  >
                    Connect Wallet
                  </Button>
                )
              }
              // if (chain.unsupported) {
              //   return (
              //     <button onClick={openChainModal} type="button">
              //       Wrong network
              //     </button>
              //   )
              // }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    className={className}
                  >
                    <span>Wrong network</span>
                    <svg
                      fill="none"
                      height="7"
                      width="14"
                      className="ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        xmlns="http://www.w3.org/2000/svg"
                      ></path>
                    </svg>
                  </Button>
                )
              }
              return (
                <Button
                  onClick={openAccountModal}
                  type="button"
                  className={className}
                >
                  <span>{account.displayName}</span>
                  <svg
                    fill="none"
                    height="7"
                    width="14"
                    className="ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      xmlns="http://www.w3.org/2000/svg"
                    ></path>
                  </svg>
                </Button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export const MobileConnectWalletButton = ({
  className,
}: {
  className?: string
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="h-[60px] w-full rounded-[10px] bg-[#BDFF02] px-11 text-lg font-medium text-[#000] lg:mr-6 lg:w-auto"
                  >
                    Connect Wallet
                  </button>
                )
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="h-[60px] w-full rounded-[10px] bg-[#BDFF02] px-11 text-lg font-medium text-[#000] lg:mr-6 lg:w-auto"
                  >
                    Wrong network
                  </button>
                )
              }
              return (
                <button
                  onClick={openAccountModal}
                  className="h-[60px] w-full rounded-[10px] bg-[#BDFF02] px-11 text-lg font-medium text-[#000] lg:mr-6 lg:w-auto"
                >
                  {account.displayName}
                </button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
