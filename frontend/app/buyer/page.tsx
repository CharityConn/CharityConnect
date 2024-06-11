import { BuyerSection } from "@/components/buyer-section"

export default function SellerPage() {
  return (
    <>
      <div className="relative flex min-h-screen flex-col bg-white">
        <div className="container mt-10 flex  flex-1 flex-col  items-center rounded border bg-white py-9 text-center shadow-lg">
          <BuyerSection />
        </div>
      </div>
    </>
  )
}
