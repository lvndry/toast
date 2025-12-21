import { Inter, Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { Provider } from "./provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-serif",
});

export const metadata = {
  title: "Clausea AI - Documents weren't written for you... until now",
  description:
    "Illuminate legal complexities with AI precision. Summarize, analyze, and perform RAG on dense legal documents instantly.",
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${newsreader.variable} scroll-smooth dark bg-background text-foreground`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/static/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/static/favicons/manifest.json" />
      </head>
      <body className="antialiased selection:bg-secondary/30">
        <div className="noise-overlay" />
        <Provider>{props.children}</Provider>
      </body>
    </html>
  );
}
