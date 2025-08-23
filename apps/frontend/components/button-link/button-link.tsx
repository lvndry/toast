import { Button } from "@chakra-ui/react";
import Link from "next/link";

export interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function ButtonLink({ href, children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Button {...props}>
        {children}
      </Button>
    </Link>
  );
}
