"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Lenis from "lenis";

import { useEffect } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      // Prevent Lenis from intercepting scroll events on nested scrollable containers
      prevent: (node) => {
        // Check if the node or any parent has overflow-y-auto
        let element = node as HTMLElement;
        while (element && element !== document.body) {
          const style = window.getComputedStyle(element);
          if (
            style.overflowY === "auto" ||
            style.overflowY === "scroll" ||
            element.hasAttribute("data-lenis-prevent")
          ) {
            return true;
          }
          element = element.parentElement as HTMLElement;
        }
        return false;
      },
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after layout settles
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
