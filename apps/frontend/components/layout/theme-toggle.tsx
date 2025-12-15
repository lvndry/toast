"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch by checking if theme is resolved
  // This is safe because resolvedTheme is only available after mount
  if (!resolvedTheme) {
    return (
      <Button variant="ghost" size="icon" aria-label="theme toggle">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="theme toggle"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      {resolvedTheme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}

export default ThemeToggle;
