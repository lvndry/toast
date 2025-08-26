"use client"

import { motion } from "framer-motion"

import { Box } from "@chakra-ui/react"

export interface MotionBoxProps {
  children?: React.ReactNode
  [key: string]: any
}

export const MotionBox = motion(Box)

export function AnimatedBox(props: MotionBoxProps) {
  return <MotionBox {...props} />
}
