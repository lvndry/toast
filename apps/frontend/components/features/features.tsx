"use client";

import { Section, SectionTitle, SectionTitleProps } from "@/components/section";
import { cn } from "@/lib/utils";

function Revealer({ children }: any) {
  return children;
}

export interface FeaturesProps extends Omit<SectionTitleProps, "title"> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  features: Array<FeatureProps>;
  columns?: number | number[];
  spacing?: string | number;
  aside?: React.ReactNode;
  reveal?: React.FC<any>;
  iconSize?: number;
  innerWidth?: string;
}

export interface FeatureProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: any;
  iconPosition?: "left" | "top";
  iconSize?: number;
  ip?: "left" | "top";
  variant?: string;
  delay?: number;
  className?: string;
}

export function Feature(props: FeatureProps) {
  const {
    title,
    description,
    icon: Icon,
    iconPosition,
    iconSize = 8,
    ip,
    className,
  } = props;

  const pos = iconPosition || ip;
  const direction = pos === "left" ? "flex-row" : "flex-col";

  return (
    <div className={cn("flex gap-4", direction, className)}>
      {Icon && (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white">
            <Icon className={cn("h-6 w-6")} />
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export function Features(props: FeaturesProps) {
  const {
    title,
    description,
    features,
    columns = 3,
    spacing = 8,
    align: alignProp = "center",
    iconSize = 8,
    aside,
    reveal: Wrap = Revealer,
    className,
    ...rest
  } = props;

  const align = !!aside ? "left" : alignProp;
  const ip = align === "left" ? "left" : "top";

  return (
    <Section className={className} {...rest}>
      <div className="flex flex-col lg:flex-row h-full items-start gap-8 lg:gap-16">
        <div className="flex-1 flex flex-col gap-8 lg:gap-12 w-full">
          {(title || description) && (
            <Wrap>
              <SectionTitle
                title={title}
                description={description}
                align={align}
              />
            </Wrap>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {features.map((feature, i) => {
              return (
                <Wrap key={i} delay={feature.delay}>
                  <Feature iconSize={iconSize} {...feature} ip={ip} />
                </Wrap>
              );
            })}
          </div>
        </div>
        {aside && <div className="flex-1 p-8 w-full lg:w-auto">{aside}</div>}
      </div>
    </Section>
  );
}
