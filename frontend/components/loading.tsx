import { SVGProps } from "react"

import { cn } from "@/lib/utils"

export const Loading = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={69}
    height={69}
    fill="none"
    className={cn("loading-animation", className)}
    {...props}
  >
    <circle
      cx={53.252}
      cy={54.594}
      r={6.25}
      fill="#1236FF"
      transform="rotate(45 53.252 54.594)"
    />
    <circle
      cx={32.964}
      cy={62.695}
      r={6.25}
      fill="#1236FF"
      transform="rotate(90 32.964 62.695)"
    />
    <circle
      cx={53.783}
      cy={14.29}
      r={6.25}
      fill="#5B85F2"
      transform="rotate(45 53.783 14.29)"
    />
    <circle
      cx={61.84}
      cy={34.572}
      r={6.25}
      fill="#5B85F2"
      transform="rotate(90 61.84 34.572)"
    />
    <circle
      cx={14.177}
      cy={14.474}
      r={6.25}
      fill="#356DFF"
      transform="rotate(45 14.177 14.474)"
    />
    <circle
      cx={33.703}
      cy={6.697}
      r={6.25}
      fill="#356DFF"
      transform="rotate(90 33.703 6.697)"
    />
    <circle
      cx={14.021}
      cy={53.015}
      r={6.25}
      fill="#011AFF"
      transform="rotate(45 14.021 53.015)"
    />
    <circle
      cx={6.34}
      cy={33.839}
      r={6.25}
      fill="#011AFF"
      transform="rotate(90 6.34 33.839)"
    />
  </svg>
)
