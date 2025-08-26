"use client"

import { Box, Container } from "@chakra-ui/react"

export interface SectionProps {
  children?: React.ReactNode
  innerWidth?: string
  [key: string]: any
}

export function Section(props: SectionProps) {
  const { children, innerWidth = "container.xl", ...rest } = props

  return (
    <Box as="section" {...rest}>
      <Container maxW={innerWidth}>{children}</Container>
    </Box>
  )
}
