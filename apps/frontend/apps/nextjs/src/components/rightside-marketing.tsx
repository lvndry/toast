"use client";

import Link from "next/link";

import { GlowingEffect } from "@saasfly/ui/glowing-effect";
import * as Icons from "@saasfly/ui/icons";

export function RightsideMarketing({ dict }: { dict: Record<string, string> | undefined; }) {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/7]"
        icon={<Icons.Rocket className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.deploy_on_vercel_title ?? ''}
        description={dict?.deploy_on_vercel_desc ?? ''}
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/7]"
        icon={<Icons.Cloud className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.ship_on_cloudflare_title ?? ''}
        description={dict?.ship_on_cloudflare_desc ?? ''}
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/7/3/13]"
        icon={<Icons.ThumbsUp className="h-4 w-4 text-black dark:text-neutral-400" />}
        title={dict?.showcase_title ?? ''}
        description={dict?.showcase_desc ?? ''}
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  link?: string;
}

const GridItem = ({ area, icon, title, description, link }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2.5xl border dark:border-neutral">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <RightsideMarketingCard icon={icon} title={title} description={description} link={link} />
      </div>
    </li>
  );
};

interface RightsideMarketingCardProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  link?: string;
}

function RightsideMarketingCard({ icon, title, description, link }: RightsideMarketingCardProps) {
  const card = (
    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6 dark:bg-neutral-900/40">
      <div className="relative flex flex-1 flex-col justify-between gap-3">
        <div className="w-fit rounded-lg border border-gray-600 dark:border-neutral-800 p-2">
          {icon}
        </div>
        <div className="space-y-3">
          <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance text-black dark:text-white">
            {title}
          </h3>
          <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] md:text-base/[1.375rem] text-black dark:text-neutral-400">
            {description}
          </h2>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} target="_blank">
        {card}
      </Link>
    );
  }
  return card;
}
