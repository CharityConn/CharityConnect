import { OfferSection } from "@/components/attestation/hero-offer-demo"
import { HeroSection } from "@/components/attestation/hero-sales-demo"
import { Footer } from "@/components/footer"
import { SiteHeaderAttestation } from "@/components/site-header-attestation"

export default function SellerPage() {
  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">
          <SiteHeaderAttestation />
          <OfferSection />
          <Footer />
        </div>
      </div>
    </>
  )
}
