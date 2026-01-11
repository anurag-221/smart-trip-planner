"use client";

import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function sendMessage(text: string) {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: "You",
      text,
      timestamp: Date.now(),
    };

    // TEMP: local echo
    setMessages((prev) => [...prev, newMessage]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[70vh] bg-slate-900 border border-slate-800 rounded-xl">
      <MessageList messages={messages} />
      <div ref={bottomRef} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}