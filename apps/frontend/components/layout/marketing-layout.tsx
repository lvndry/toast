"use client";

import { ReactNode } from "react";

import {
  AnnouncementBanner,
  AnnouncementBannerProps,
} from "../announcement-banner";
import { Footer, FooterProps } from "./footer";
import { Header, HeaderProps } from "./header";

interface LayoutProps {
  children: ReactNode;
  announcementProps?: AnnouncementBannerProps;
  headerProps?: HeaderProps;
  footerProps?: FooterProps;
}

export const MarketingLayout: React.FC<LayoutProps> = (props) => {
  const { children, announcementProps, headerProps, footerProps } = props;
  return (
    <div>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-md"
      >
        Skip to content
      </a>
      {announcementProps ? <AnnouncementBanner {...announcementProps} /> : null}
      <Header {...headerProps} />
      <main id="content">{children}</main>
      <Footer {...footerProps} />
    </div>
  );
};
