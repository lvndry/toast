import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";

import "./globals.css";
import { Provider } from "./provider";

export const metadata = {
  title: "Toast AI - Understand Legal Documents in Plain English",
  description:
    "Transform complex privacy policies and terms of service into clear, actionable insights. Know what you're agreeing to in under 60 seconds.",
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
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
      <body className="font-sans antialiased">
        <Provider>{props.children}</Provider>
      </body>
    </html>
  );
}
