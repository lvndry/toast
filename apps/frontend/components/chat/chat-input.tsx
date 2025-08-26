"use client"

import { FiSend } from "react-icons/fi"

import { useCallback } from "react"

import { Button, HStack, Input } from "@chakra-ui/react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        onSend()
      }
    },
    [onSend],
  )

  return (
    <HStack spacing={3}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        size="lg"
      />
      <Button
        colorScheme="blue"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="lg"
      >
        <FiSend />
      </Button>
    </HStack>
  )
}

export default ChatInput
