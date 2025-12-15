"use client";

import { cn } from "@/lib/utils";

export function BackgroundGradient({ hideOverlay, className, ...props }: any) {
  // Using Tailwind colors directly or CSS variables
  const colors = [
    "#652ee3", // primary-800 equivalent
    "#4662e4", // secondary-500 equivalent
    "#0bc5ea", // cyan-500 equivalent
    "#319795", // teal-500 equivalent
  ];

  const fallbackBackground = `radial-gradient(at top left, ${colors[0]} 30%, transparent 80%), radial-gradient(at bottom, ${colors[1]} 0%, transparent 60%), radial-gradient(at bottom left, ${colors[2]} 0%, transparent 50%),
        radial-gradient(at top right, ${colors[3]}, transparent), radial-gradient(at bottom right, ${colors[0]} 0%, transparent 50%)`;

  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-0 h-screen w-full overflow-hidden pointer-events-none opacity-30 dark:opacity-50",
        className,
      )}
      style={{
        backgroundImage: fallbackBackground,
        backgroundBlendMode: "saturation",
      }}
      {...props}
    >
      {!hideOverlay && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(0deg, var(--background) 60%, rgba(0, 0, 0, 0) 100%)",
          }}
        ></div>
      )}
    </div>
  );
}
