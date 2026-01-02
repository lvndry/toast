import * as React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
      src="/static/favicons/logo.png"
      alt="Clausea"
      className={className}
      {...props}
    />
  );
}
