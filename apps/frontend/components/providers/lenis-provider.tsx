"use client";

import Lenis from "lenis";

import { useEffect } from "react";

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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
