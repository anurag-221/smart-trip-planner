"use client";

import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useTripSocket } from "@/hooks/useTripSocket";
import { apiFetch } from "@/lib/api";

export type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  status?: "sent" | "delivered" | "seen";
};

export default function Chat({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  console.log("Chat useEffect running");

  async function loadMessages() {
    console.log("📡 Calling messages API");
    try {
      const data = await apiFetch<Message[]>(
        `/trips/${tripId}/messages`
      );
      console.log(" Messages loaded:", data);
      setMessages(data);
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  }

  loadMessages();
}, [tripId]);


  const { sendMessage, sendTyping, sendStopTyping } = useTripSocket(tripId, (event) => {
    if (event.type === "CHAT_MESSAGE") {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === event.payload.id);

        if (exists) {
          // Update status only
          return prev.map((m) =>
            m.id === event.payload.id ? { ...m, status: "delivered" } : m
          );
        }

        // Ensure payload conforms to Message
        const incoming: Message = {
          ...event.payload,
          status: event.payload.status ?? "delivered",
        };

        return [...prev, incoming];
      });
    }

    if (event.type === "USER_JOINED") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "system",
          text: `${event.payload.user} joined the trip`,
          timestamp: Date.now(),
        },
      ]);
    }

    if (event.type === "USER_LEFT") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "system",
          text: `${event.payload.user} left the trip`,
          timestamp: Date.now(),
        },
      ]);
    }

    if (event.type === "USER_TYPING") {
    setTypingUser(event.payload.user);
    }

    if (event.type === "USER_STOPPED_TYPING") {
    setTypingUser(null);
    }

  });

  function handleSend(text: string) {
    const message: Message = {
      id: crypto.randomUUID(),
      sender: "You",
      text,
      timestamp: Date.now(),
      status: "sent",
    };

    // Optimistic UI
    setMessages((prev) => [...prev, message]);
    sendMessage(message);
  }

  function handleScroll() {
  const el = containerRef.current;
  if (!el) return;

  const atBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight < 50;

  setShowNewMsg(!atBottom);
}

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[70vh] bg-slate-900 border border-slate-800 rounded-xl">
      <MessageList messages={messages} />
      <div ref={bottomRef} />
      {typingUser && (
  <div className="px-4 pb-1 text-xs text-slate-400">
    {typingUser} is typing…
  </div>
)}
      <ChatInput 
        onSend={handleSend} 
        onTyping={() => sendTyping("Someone")}
        onStopTyping={() => sendStopTyping("Someone")} 
      />
    </div>
  );
}