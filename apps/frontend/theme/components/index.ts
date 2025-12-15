import { default as Button } from "./button";
import { Feature, default as Features } from "./features";
import { default as SectionTitle } from "./section-title";

// Minimal index that exposes theme descriptors for migration. Components should
// prefer Tailwind classNames or shadcn components rather than these tokens.
export default { Button, Features, Feature, SectionTitle };
