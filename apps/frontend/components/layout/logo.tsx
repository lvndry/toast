import NextLink from "next/link";

import siteConfig from "@data/config";

export interface LogoProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Logo({ href = "/", onClick }: LogoProps) {
  let logo;
  if (siteConfig.logo) {
    const LogoComponent = siteConfig.logo;
    logo = (
      <div className="h-8 -mt-1">
        <LogoComponent />
      </div>
    );
  } else {
    logo = <h1 className="text-lg font-semibold">{siteConfig.seo?.title}</h1>;
  }

  return (
    <div className="h-8 flex-shrink-0 flex items-start">
      <NextLink
        href={href}
        className="flex p-1 rounded-sm hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {logo}
        <span className="sr-only">{siteConfig.seo?.title}</span>
      </NextLink>
    </div>
  );
}
