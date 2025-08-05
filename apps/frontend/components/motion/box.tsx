"use client"

import { ChakraProps, chakra } from "@chakra-ui/react"
import { HTMLMotionProps, motion } from "framer-motion"

export interface MotionBoxProps
  extends Omit<HTMLMotionProps<"div">, "children" | "style">,
    Omit<ChakraProps, "transition" | "color"> {
  children?: React.ReactNode
}

export const MotionBox = motion.create(chakra.div)
