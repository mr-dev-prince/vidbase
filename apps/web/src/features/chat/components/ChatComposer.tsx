"use client";

import { SendHorizontal } from "lucide-react";
import { useId } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatComposer({
  onSend,
  placeholder = "Say something…",
  disabled,
  className,
}: ChatComposerProps) {
  const inputId = useId();

  // A form action resets the (uncontrolled) input after each send.
  const send = (formData: FormData) => {
    onSend(String(formData.get("message") ?? ""));
  };

  return (
    <form
      action={send}
      className={cn("flex items-center gap-2 p-3", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Message
      </label>
      <TextField
        id={inputId}
        name="message"
        placeholder={placeholder}
        autoComplete="off"
        maxLength={280}
        required
        disabled={disabled}
        className="h-11"
      />
      <IconButton
        type="submit"
        label="Send"
        tone="ink"
        size="sm"
        disabled={disabled}
        icon={<SendHorizontal className="size-5" />}
      />
    </form>
  );
}
