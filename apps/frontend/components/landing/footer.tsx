"use client";

import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-20 bg-secondary border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xl">
                T
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">
                Clausea
              </span>
            </div>
            <p className="text-white/60 font-medium max-w-xs leading-relaxed">
              Precision legal intelligence powered by RAG. Understand, query,
              and secure your documents with AI that actually understands
              context.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white uppercase tracking-widest text-xs">
              Product
            </h4>
            <ul className="space-y-4">
              {["Features", "Pricing", "Security", "AI Models", "API"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white/60 hover:text-primary font-bold text-sm transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white uppercase tracking-widest text-xs">
              Company
            </h4>
            <ul className="space-y-4">
              {["About", "Blog", "Careers", "Newsroom", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white/60 hover:text-primary font-bold text-sm transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white uppercase tracking-widest text-xs">
              Legal
            </h4>
            <ul className="space-y-4">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "GDPR",
                "DPA",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-primary font-bold text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Clausea. Precision AI for high-stakes
            legal.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              Platform Status:{" "}
              <span className="text-green-500">All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
