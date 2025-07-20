import {
  Button,
  Input,
} from "@once-ui-system/core";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        id="chat-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyPress}
        disabled={disabled}
      />
      <Button
        size="m"
        weight="strong"
        prefixIcon="plane"
        onClick={onSend}
        disabled={!value.trim() || disabled}
      >
        Send
      </Button>
    </div>
  );
}
