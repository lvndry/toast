import { ArrowRight } from "lucide-react";
import NextLink from "next/link";

import { Button } from "@/components/ui/button";

import { FallInPlace } from "../motion/fall-in-place";

export interface AnnouncementBannerProps {
  title: string;
  description: string;
  href: string;
  action?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = (
  props,
) => {
  const { title, description, href, action } = props;
  if (!title) {
    return null;
  }

  return (
    <div className="absolute z-10 top-[100px] w-full">
      <div className="container max-w-8xl mx-auto px-8">
        <FallInPlace delay={1.4} translateY="-100px">
          <NextLink href={href}>
            <div className="relative flex items-center justify-center bg-background dark:bg-gray-900 text-sm rounded-full max-w-md mx-auto py-1 px-3 overflow-visible cursor-pointer transition-all duration-200 hover:shadow-md before:content-[''] before:absolute before:z-[-1] before:inset-0 before:rounded-full before:m-[-2px] before:bg-gradient-to-r before:from-purple-500 before:to-cyan-500 before:transition-all before:duration-200">
              <div className="relative flex items-center gap-3 z-[2]">
                <h3 className="font-semibold line-clamp-1">{title}</h3>
                <div
                  className="hidden md:block"
                  dangerouslySetInnerHTML={{ __html: description }}
                />

                {action && (
                  <Button
                    size="sm"
                    variant="link"
                    className="text-muted-foreground hover:no-underline group"
                  >
                    Read more
                    <ArrowRight className="ml-2 h-3 w-3 -translate-x-1 transition-transform group-hover:translate-x-0" />
                  </Button>
                )}
              </div>
            </div>
          </NextLink>
        </FallInPlace>
      </div>
    </div>
  );
};
