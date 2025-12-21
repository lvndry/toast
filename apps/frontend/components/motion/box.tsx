"use client";

import { motion } from "motion/react";

export interface MotionBoxProps {
  children?: React.ReactNode;
}

export const MotionBox = motion.div;

export function AnimatedBox(props: MotionBoxProps) {
  return <MotionBox {...props} />;
}
