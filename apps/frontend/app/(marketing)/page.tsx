import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { ProblemSection } from "@/components/landing/problem-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 w-full">
      <LandingHeader />
      <main className="flex-1 w-full">
        <Hero />
        <ProblemSection />
        <InteractiveDemo />
        <Features />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}
