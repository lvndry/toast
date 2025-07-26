import {
  Button
} from "@once-ui-system/core";
import { useEffect, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyPress}
            disabled={disabled}
            rows={1}
            className="w-full p-12 text-base rounded-2xl border-white/20 bg-white/60 backdrop-blur-sm focus:bg-white/80 focus:border-blue-500/30 transition-all duration-200 shadow-sm hover:shadow-md resize-none overflow-y-auto min-h-[56px] max-h-32"
            style={{ fontFamily: 'inherit' }}
          />
        </div>
        <Button
          size="m"
          weight="strong"
          prefixIcon="plane"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-shrink-0"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
