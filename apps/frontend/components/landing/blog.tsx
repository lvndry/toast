"use client";

import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const posts = [
  {
    title: "The Future of RAG in Legal Compliance",
    excerpt:
      "How Retrieval-Augmented Generation is changing the way lawyers interact with large document sets.",
    date: "Dec 12, 2025",
    category: "AI & Legal",
  },
  {
    title: "Understanding SOC2 Type II for SaaS",
    excerpt:
      "A deep dive into why security certifications matter more than ever in the age of AI. ",
    date: "Dec 08, 2025",
    category: "Security",
  },
  {
    title: "5 Hidden Risks in Standard Privacy Policies",
    excerpt:
      "We analyzed 1,000 policies and found these recurring red flags you should look out for.",
    date: "Dec 01, 2025",
    category: "Insights",
  },
];

export function Blog() {
  return (
    <section id="blog" className="py-32 bg-[#F8F9FA] relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-primary font-black uppercase tracking-[0.2em] text-xs"
            >
              Latest Insights
            </motion.div>
            <h2 className="text-4xl font-black text-secondary tracking-tighter">
              Deep Dives &{" "}
              <span className="text-primary italic">Legal Tech</span> Trends
            </h2>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-secondary text-secondary font-bold px-8 hover:bg-secondary hover:text-white transition-all"
          >
            View All Posts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col p-8 rounded-[2.5rem] bg-white border border-border shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-bold uppercase tracking-widest ml-auto">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                {post.excerpt}
              </p>
              <Link
                href="#"
                className="inline-flex items-center text-sm font-black text-secondary hover:gap-3 transition-all"
              >
                Read Article{" "}
                <ArrowRight className="ml-2 h-4 w-4 text-primary" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[3rem] bg-secondary p-12 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-md text-center lg:text-left">
              <h3 className="text-3xl font-black text-white mb-4">
                Stay updated with Clausea
              </h3>
              <p className="text-white/60 font-medium">
                Join 2,000+ legal pros receiving our monthly digest of AI
                compliance insights.
              </p>
            </div>
            <div className="w-full max-w-md flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter your email"
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl px-6 focus-visible:ring-primary/50"
              />
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/30 shrink-0">
                Subscribe Now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
