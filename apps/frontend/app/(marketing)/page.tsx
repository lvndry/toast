import AsymmetricGrid from "@/components/clausea/AsymmetricGrid";
import ComplexityToClarity from "@/components/clausea/ComplexityToClarity";
import GSAPInit from "@/components/clausea/GSAPInit";
import Hero from "@/components/clausea/Hero";
import { CustomCursor, Header } from "@/components/clausea/Navigation";
import { Footer, Pricing } from "@/components/clausea/PricingAndFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary/30 w-full overflow-hidden">
      <GSAPInit />
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
