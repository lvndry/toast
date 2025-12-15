"use client";

const LOGOS = [
  "Spotify",
  "Netflix",
  "TikTok",
  "Instagram",
  "Uber",
  "Airbnb",
  "Slack",
  "Zoom",
];

export function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-black/20 overflow-hidden">
      <div className="container px-4 md:px-6 mb-8 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Trusted by privacy advocates at
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {LOGOS.map((logo, i) => (
            <span
              key={i}
              className="mx-12 text-2xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
          {LOGOS.map((logo, i) => (
            <span
              key={`duplicate-${i}`}
              className="mx-12 text-2xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </div>

        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
          {LOGOS.map((logo, i) => (
            <span
              key={`duplicate-2-${i}`}
              className="mx-12 text-2xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
          {LOGOS.map((logo, i) => (
            <span
              key={`duplicate-3-${i}`}
              className="mx-12 text-2xl font-bold text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
