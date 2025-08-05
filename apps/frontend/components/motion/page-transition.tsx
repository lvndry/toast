import { MotionBox, MotionBoxProps } from "./box";

export function PageTransition(props: MotionBoxProps) {
  return (
    <MotionBox
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      {...props}
    />
  );
}
