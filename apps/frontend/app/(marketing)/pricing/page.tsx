import { CustomCursor, Header } from "@/components/legallens/Navigation";
import { Footer, Pricing } from "@/components/legallens/PricingAndFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary/30 w-full overflow-hidden">
      <CustomCursor />
      <Header />

      <main className="pt-32">
        <Pricing />

        {/* Comparison Table */}
        <section className="py-24 px-4 md:px-8 max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="py-8 font-display font-bold text-2xl">
                  Features
                </th>
                <th className="py-8 font-display font-bold text-lg text-primary/60">
                  Standard
                </th>
                <th className="py-8 font-display font-bold text-lg text-secondary">
                  Pro
                </th>
                <th className="py-8 font-display font-bold text-lg text-primary/60">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                ["Documents per month", "10", "Unlimited", "Unlimited"],
                ["Max File Size", "5MB", "50MB", "1GB+"],
                ["Team Seats", "1", "5", "Unlimited"],
                ["Semantic Search", "Basic", "Advanced", "Custom Tuned"],
                ["API Access", "-", "Coming Soon", "Available"],
                ["Priority Support", "-", "Yes", "Dedicated"],
              ].map(([feature, s, p, e]) => (
                <tr
                  key={feature}
                  className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                >
                  <td className="py-6 font-bold text-primary group-hover:text-secondary transition-colors">
                    {feature}
                  </td>
                  <td className="py-6 text-primary/60">{s}</td>
                  <td className="py-6 text-primary font-bold">{p}</td>
                  <td className="py-6 text-primary/60">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ Preview */}
        <section className="py-24 px-4 md:px-8 max-w-3xl mx-auto text-center">
          <h4 className="text-3xl font-display font-bold mb-12">
            Common Questions
          </h4>
          <div className="space-y-8 text-left">
            {[
              {
                q: "Is my document data private?",
                a: "Absolutely. We employ enterprise-grade encryption and never use your documents to train public AI models.",
              },
              {
                q: "Can I cancel my subscription any time?",
                a: "Yes, you can cancel or switch plans from your dashboard at any moment with no hidden fees.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-primary/5"
              >
                <h5 className="font-bold text-primary mb-2">{faq.q}</h5>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
