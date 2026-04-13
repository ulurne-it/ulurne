import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { SocialProof } from "@/components/sections/social-proof";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { AppShowcase } from "@/components/sections/app-showcase";
import { TutorSpotlight } from "@/components/sections/tutor-spotlight";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/30">
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <FeaturesGrid />
        <AppShowcase />
        <TutorSpotlight />
        {/* <Pricing /> */}
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
