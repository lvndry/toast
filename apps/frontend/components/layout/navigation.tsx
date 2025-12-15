"use client";

import { useScrollSpy } from "hooks/use-scrollspy";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { MobileNav } from "@components/mobile-nav";
import { NavLink } from "@components/nav-link";
import siteConfig from "@data/config";

import ThemeToggle from "./theme-toggle";

function Navigation() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const path = usePathname();
  const activeId = useScrollSpy(
    siteConfig.header.links
      .filter(({ id }) => id)
      .map(({ id }) => `[id="${id}"]`),
    {
      threshold: 0.75,
    },
  );

  const mobileNavBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {siteConfig.header.links.map(({ href, id, ...props }, i) => {
        return (
          <NavLink
            display={["none", "block"]}
            href={href || `/#${id}`}
            key={i}
            isActive={
              !!(
                (id && activeId === id) ||
                (href && !!path?.match(new RegExp(href)))
              )
            }
            {...props}
          >
            {props.label}
          </NavLink>
        );
      })}

      <ThemeToggle />

      <Button
        ref={mobileNavBtnRef}
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open Menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        {siteConfig.header.links.map(({ href, id, ...props }, i) => (
          <NavLink
            key={i}
            href={href || `/#${id}`}
            isActive={
              !!(
                (id && activeId === id) ||
                (href && !!path?.match(new RegExp(href)))
              )
            }
            {...props}
          >
            {props.label}
          </NavLink>
        ))}
      </MobileNav>
    </div>
  );
}

export default Navigation;
