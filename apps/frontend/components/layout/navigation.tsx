"use client";

import { HStack, useDisclosure, useUpdateEffect } from "@chakra-ui/react";
import { useScrollSpy } from "hooks/use-scrollspy";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { MobileNavButton, MobileNavContent } from "@components/mobile-nav";
import { NavLink } from "@components/nav-link";
import siteConfig from "@data/config";

import ThemeToggle from "./theme-toggle";

function Navigation() {
  const mobileNav = useDisclosure();
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

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus();
  }, [mobileNav.isOpen]);

  return (
    <HStack spacing="2" flexShrink={0}>
      {siteConfig.header.links.map(({ href, id, ...props }, i) => {
        return (
          <NavLink
            display={["none", null, "block"]}
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

      <MobileNavButton
        ref={mobileNavBtnRef}
        aria-label="Open Menu"
        onClick={mobileNav.onOpen}
      />

      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
    </HStack>
  );
}

export default Navigation;
