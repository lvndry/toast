"use client"

import NextLink from "next/link"

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { useClerk, useUser } from "@clerk/nextjs"

import { Logo } from "./logo"

export interface DashboardHeaderProps {
  children?: React.ReactNode
  [key: string]: any
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { children, ...rest } = props
  const { user } = useUser()
  const { signOut } = useClerk()

  const userMenu = (
    <Menu>
      <MenuButton as={Button} variant="ghost" size="sm">
        <HStack spacing={2}>
          <Text fontSize="sm" fontWeight="medium">
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem as={NextLink} href="/profile">
          Profile
        </MenuItem>
        <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
      </MenuList>
    </Menu>
  )

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      {...rest}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          <Logo />
          <HStack gap={6}>{children ?? userMenu}</HStack>
        </Flex>
      </Container>
    </Box>
  )
}
