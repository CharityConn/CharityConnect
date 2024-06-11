import { Hamburger } from "@/components/icons/hamburger"

interface HeaderHamburgerProps {
  onClick: () => void
  hamburgerClassName?: string
}
export const HeaderHamburger = (props: HeaderHamburgerProps) => {
  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
        onClick={props.onClick}
      >
        <span className="sr-only">Open main menu</span>
        <div className={props.hamburgerClassName}>
          <Hamburger className="h-6 w-6" aria-hidden="true" />
        </div>
      </button>
    </div>
  )
}
