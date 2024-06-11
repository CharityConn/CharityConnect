import { SVGProps } from "react"

export const Hamburger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      d="M1 15h21M1 8h21M1 1h21"
    />
  </svg>
)

export const CloseHamburger = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M17.774 19.317a1.09 1.09 0 1 0 1.543-1.543L13.543 12l5.774-5.774a1.091 1.091 0 0 0-1.543-1.543L12 10.457 6.226 4.683a1.09 1.09 0 1 0-1.543 1.543L10.457 12l-5.774 5.774a1.09 1.09 0 0 0 1.543 1.543L12 13.543l5.774 5.774Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
