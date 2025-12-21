import AsymmetricGrid from "@/components/legallens/AsymmetricGrid";
import ComplexityToClarity from "@/components/legallens/ComplexityToClarity";
import Hero from "@/components/legallens/Hero";
import { CustomCursor, Header } from "@/components/legallens/Navigation";
import { Footer, Pricing } from "@/components/legallens/PricingAndFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary/30 w-full overflow-hidden">
      <CustomCursor />
      <Header />
      <main className="flex-1 w-full">
        <Hero />
        <ComplexityToClarity />
        <AsymmetricGrid />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
