"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
  Scale,
  Shield,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FileSearch,
    title: "Plain Language Summaries",
    description:
      "Complex legal jargon transformed into clear, understandable English that anyone can grasp.",
  },
  {
    icon: Scale,
    title: "Risk Scoring",
    description:
      "Get quantified risk assessments (0-10 scale) so you know exactly what you're signing up for.",
  },
  {
    icon: Shield,
    title: "Compliance Checking",
    description:
      "Verify GDPR, CCPA, and other regulatory compliance with detailed breakdowns.",
  },
  {
    icon: Clock,
    title: "Instant Analysis",
    description:
      "Upload any legal document and get comprehensive analysis in under 60 seconds.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Highlighting",
    description:
      "Automatically identify concerning clauses, hidden fees, and liability exposure.",
  },
  {
    icon: CheckCircle2,
    title: "Your Rights",
    description:
      "Clear breakdown of your data rights, opt-out options, and what you can control.",
  },
];

export default function FeaturesSection() {
  useGSAP(() => {
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".features-grid",
        start: "top 80%",
      },
    });
  }, []);

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Make Informed Decisions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to give you clarity and confidence when
            reviewing legal documents.
          </p>
        </div>

        <div className="features-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="feature-card group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
