"use client";

import { type MotionProps, motion } from "framer-motion";

export interface MotionBoxProps extends MotionProps {
  children?: React.ReactNode;
}

export const MotionBox = motion.div;

export function AnimatedBox(props: MotionBoxProps) {
  return <MotionBox {...props} />;
}
