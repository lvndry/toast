"use client"

import { SimpleGrid, VStack } from "@chakra-ui/react"

export interface TestimonialsProps {
  children?: React.ReactNode
  columns?: number | number[]
  [key: string]: any
}

export function Testimonials(props: TestimonialsProps) {
  const { children, columns = [1, 2, 3], ...rest } = props

  return (
    <VStack gap={8} {...rest}>
      <SimpleGrid columns={columns} gap={6}>
        {children}
      </SimpleGrid>
    </VStack>
  )
}
