"use client";

import { useRef, useState } from "react";

export default function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
}: {
  onSend: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}) {
  const [text, setText] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);

    onTyping();

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      onStopTyping();
    }, 1000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 🚫 prevent new line
      send();
    }
  }

  function send() {
    if (!text.trim()) return;

    onSend(text.trim());
    setText("");
    onStopTyping();
  }

  return (
    <div className="flex gap-2 p-3 border-t border-slate-800">
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        rows={1}
        className="flex-1 resize-none p-2 rounded bg-slate-800 text-white focus:outline-none"
      />

      <button
        onClick={send}
        className="px-4 py-2 bg-emerald-600 rounded"
      >
        Send
      </button>
    </div>
  );
}