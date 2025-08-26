"use client"

import { Box, IconButton, VStack } from "@chakra-ui/react"

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  [key: string]: any
}

export function MobileNav(props: MobileNavProps) {
  const { isOpen, onClose, children, ...rest } = props

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="white"
      zIndex={1000}
      {...rest}
    >
      <VStack gap={4} p={6}>
        <IconButton
          aria-label="Close menu"
          name="close"
          onClick={onClose}
          alignSelf="flex-end"
        />
        {children}
      </VStack>
    </Box>
  )
}
