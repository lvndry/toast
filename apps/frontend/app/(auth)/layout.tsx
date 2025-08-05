import { Box } from "@chakra-ui/react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {children}
    </Box>
  )
} 