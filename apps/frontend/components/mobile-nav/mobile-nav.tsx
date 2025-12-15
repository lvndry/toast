"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function MobileNav(props: MobileNavProps) {
  const { isOpen, onClose, children, className, ...rest } = props;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className={cn("w-full sm:w-[400px]", className)}
        {...rest}
      >
        <div className="flex flex-col gap-4 mt-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
