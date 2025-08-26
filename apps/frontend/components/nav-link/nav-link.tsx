import Link from "next/link"

import { Button } from "@chakra-ui/react"

export interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive?: boolean
  [key: string]: any
}

export function NavLink({ href, children, isActive, ...props }: NavLinkProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Button
        variant={isActive ? "solid" : "ghost"}
        colorScheme={isActive ? "blue" : "gray"}
        {...props}
      >
        {children}
      </Button>
    </Link>
  )
}
