import { Cpu, Lock, Shield, Zap } from "lucide-react";

import AsymmetricGrid from "@/components/legallens/AsymmetricGrid";
import FeatureInteractions from "@/components/legallens/FeatureInteractions";
import { CustomCursor, Header } from "@/components/legallens/Navigation";
import { Footer } from "@/components/legallens/PricingAndFooter";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary/30 w-full overflow-hidden">
      <CustomCursor />
      <Header />

      <main className="pt-32">
        {/* Simple Header */}
        <section className="px-4 md:px-8 max-w-7xl mx-auto text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary mb-8">
            Advanced Legal <br />
            <span className="text-secondary italic">Infrastructure.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LegalLens isn&apos;t just a chatbot. It&apos;s a sophisticated RAG
            engine built specifically for the high-stakes world of legal and
            compliance.
          </p>
        </section>

        {/* Interactive Demo Section */}
        <section className="px-4 md:px-8 pb-32">
          <FeatureInteractions />
        </section>

        {/* Deep Dive Grid */}
        <AsymmetricGrid />

        {/* Technical Specs */}
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-secondary flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display">
                Zero-Train Policy
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is never used to train public LLM models. Period. We
                use isolated instances for every client.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display">Sub-Second RAG</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our vector index is optimized for dense legal text, providing
                sub-second retrieval across 100k+ pages.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent-foreground flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display">SOC2 Type II</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enterprise security built-in. Data encryption at rest and in
                transit with strict role-based access.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold font-display">Model Agnostic</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Switch between specialized models for different document types:
                from contracts to compliance policies.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
