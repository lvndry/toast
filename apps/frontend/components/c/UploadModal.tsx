"use client"

import { FiUpload } from "react-icons/fi"

import {
  Box,
  Button,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileSelected: (file: File) => void
}

export default function UploadModal({
  isOpen,
  onClose,
  onFileSelected,
}: UploadModalProps) {
  const cardBg = useColorModeValue("white", "gray.800")
  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
      onClick={() => onClose()}
    >
      <Box
        bg={cardBg}
        borderRadius="lg"
        shadow="xl"
        p={6}
        w="md"
        maxW="md"
        boxShadow="lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Heading size="md" mb={4}>
          Upload Additional Documents
        </Heading>
        <VStack spacing={4}>
          <Box
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={6}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: "blue.500" }}
            onClick={() =>
              document.getElementById("file-upload-modal")?.click()
            }
          >
            <VStack spacing={3}>
              <FiUpload size={24} color="gray.400" />
              <Text color="gray.600">Click to upload or drag and drop</Text>
              <Text fontSize="sm" color="gray.500">
                PDF, DOC, DOCX, TXT files supported
              </Text>
              <Text fontSize="xs" color="gray.400">
                Only legal documents will be processed
              </Text>
            </VStack>
            <input
              id="file-upload-modal"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileSelected(file)
              }}
            />
          </Box>
        </VStack>
        <HStack spacing={3} mt={6} justify="flex-end">
          <Button variant="ghost" onClick={() => onClose()}>
            Cancel
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
