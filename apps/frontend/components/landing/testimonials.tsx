"use client";

import { Globe2, Lock, Quote, ShieldCheck, Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    quote:
      "Clausea has completely transformed our legal review process. What used to take days now takes minutes.",
    author: "Sarah Jenkins",
    role: "General Counsel, TechFlow",
    avatar: "SJ",
  },
  {
    quote:
      "The RAG-powered queries are a game changer. Being able to ask questions directly to a 200-page contract is magic.",
    author: "Michael Chen",
    role: "Compliance Lead, FinSecure",
    avatar: "MC",
  },
  {
    quote:
      "Finally, a legal AI tool that actually understands context. The risk scoring is incredibly accurate.",
    author: "Eleanor Vance",
    role: "Partner, Vance & Associates",
    avatar: "EV",
  },
];

const badges = [
  { icon: ShieldCheck, label: "GDPR Compliant" },
  { icon: Lock, label: "SOC2 Type II" },
  { icon: Globe2, label: "ISO 27001" },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-32 bg-[#F8F9FA] border-y border-border"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Left: Content & Badges */}
          <div className="lg:w-1/3 space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-primary font-black uppercase tracking-[0.2em] text-xs"
              >
                Trust & Security
              </motion.div>
              <h2 className="text-4xl font-black text-secondary leading-tight">
                Trusted by the world's most{" "}
                <span className="text-primary">secure</span> teams.
              </h2>
              <p className="text-muted-foreground">
                We take security seriously. Your documents are encrypted and
                never used to train global models.
              </p>
            </div>

            <div className="space-y-4">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm"
                >
                  <badge.icon className="h-6 w-6 text-primary" />
                  <span className="font-bold text-secondary text-sm">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Testimonials Grid */}
          <div className="lg:w-2/3 grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-8 rounded-[2.5rem] bg-white border border-border shadow-xl relative ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <Quote className="absolute top-8 right-8 h-12 w-12 text-primary/5" />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p
                  className={`text-secondary font-medium leading-relaxed mb-8 ${i === 0 ? "text-xl md:text-2xl" : "text-lg"}`}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-secondary">{t.author}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
