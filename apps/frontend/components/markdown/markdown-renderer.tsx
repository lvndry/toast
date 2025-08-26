"use client"

import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import {
  Box,
  Link as ChakraLink,
  Code,
  Heading,
  ListItem,
  OrderedList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
} from "@chakra-ui/react"

interface MarkdownRendererProps {
  children: string
}

const components: Components = {
  a: ({ href, children }) => (
    <ChakraLink
      href={href as string}
      isExternal
      color="blue.500"
      textDecoration="underline"
    >
      {children}
    </ChakraLink>
  ),
  p: ({ children }) => <Text mb={3}>{children}</Text>,
  strong: ({ children }) => <Text as="strong">{children}</Text>,
  em: ({ children }) => <Text as="em">{children}</Text>,
  ul: ({ children }) => (
    <UnorderedList pl={5} mb={3}>
      {children}
    </UnorderedList>
  ),
  ol: ({ children }) => (
    <OrderedList pl={5} mb={3}>
      {children}
    </OrderedList>
  ),
  li: ({ children }) => <ListItem>{children}</ListItem>,
  h1: ({ children }) => (
    <Heading as="h1" size="xl" mt={4} mb={3}>
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as="h2" size="lg" mt={4} mb={3}>
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" size="md" mt={4} mb={2}>
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading as="h4" size="sm" mt={4} mb={2}>
      {children}
    </Heading>
  ),
  h5: ({ children }) => (
    <Heading as="h5" size="xs" mt={4} mb={2}>
      {children}
    </Heading>
  ),
  h6: ({ children }) => (
    <Heading as="h6" size="xs" mt={4} mb={2} color="gray.600">
      {children}
    </Heading>
  ),
  blockquote: ({ children }) => (
    <Box
      pl={4}
      borderLeft="4px solid"
      borderColor="gray.300"
      color="gray.600"
      my={3}
    >
      {children}
    </Box>
  ),
  code: ({ className, children, ...props }: any) => {
    const isBlock =
      typeof className === "string" && className.includes("language-")
    if (isBlock) {
      return (
        <Box
          as="pre"
          overflowX="auto"
          p={3}
          bg="gray.800"
          color="gray.100"
          borderRadius="md"
          mb={3}
        >
          <code className={className} {...props}>
            {children}
          </code>
        </Box>
      )
    }
    return <Code {...props}>{children}</Code>
  },
  table: ({ children }) => (
    <Box overflowX="auto" mb={3}>
      <Table size="sm" variant="simple">
        {children}
      </Table>
    </Box>
  ),
  thead: ({ children }) => <Thead>{children}</Thead>,
  tbody: ({ children }) => <Tbody>{children}</Tbody>,
  tr: ({ children }) => <Tr>{children}</Tr>,
  th: ({ children }) => <Th>{children}</Th>,
  td: ({ children }) => <Td>{children}</Td>,
  hr: () => <Box as="hr" borderColor="gray.200" my={4} />,
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
