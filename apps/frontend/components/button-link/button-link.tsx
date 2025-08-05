import { Button, ButtonProps } from "@chakra-ui/react";
import NextLink, { LinkProps } from "next/link";

export type ButtonLinkProps = LinkProps & ButtonProps;

export function ButtonLink({ href, children, ...rest }: ButtonLinkProps) {
  return (
    <NextLink href={href} passHref>
      <Button {...rest}>{children}</Button>
    </NextLink>
  );
}
