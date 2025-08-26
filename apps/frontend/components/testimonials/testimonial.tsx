"use client"

import { Avatar, Heading, Text, VStack } from "@chakra-ui/react"

export interface TestimonialProps {
  name: string
  description?: React.ReactNode
  avatar?: string
  [key: string]: any
}

export function Testimonial(props: TestimonialProps) {
  const { name, description, avatar, ...rest } = props

  return (
    <VStack p={6} bg="white" borderRadius="lg" shadow="md" gap={4} {...rest}>
      {avatar && <Avatar src={avatar} size="lg" />}
      <VStack gap={2}>
        <Heading size="md" fontWeight="semibold">
          {name}
        </Heading>
        {description && (
          <Text color="gray.600" textAlign="center">
            {description}
          </Text>
        )}
      </VStack>
    </VStack>
  )
}
