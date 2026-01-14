"use client";

import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useTripSocket } from "@/hooks/useTripSocket";
import { apiFetch } from "@/lib/api";
import { useMe } from "@/hooks/useMe";

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "seen";
};

function normalizeMessage(raw: any): Message {
  return {
    id: raw.id,
    senderId: raw.senderId ?? "unknown",
    senderName: raw.sender ?? raw.senderName ?? "Unknown",
    text: raw.text ?? "",
    timestamp:
      typeof raw.timestamp === "number"
        ? raw.timestamp
        : new Date(raw.createdAt ?? Date.now()).getTime(),
    status: raw.status ?? "delivered",
  };
}

export default function Chat({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const me = useMe();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  /* ---------------- LOAD FROM DB ---------------- */
  useEffect(() => {
  async function loadMessages() {
    try {
      const data = await apiFetch<any[]>(
        `/trips/${tripId}/messages`
      );

      const normalized: Message[] = data.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text ?? "",
        timestamp: m.timestamp,
        status: "delivered",
      }));

      setMessages(normalized);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }

  loadMessages();
}, [tripId]);

 useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);

  /* ---------------- WS EVENTS ---------------- */
  const { sendMessage, sendTyping, sendStopTyping, sendSeen } =
    useTripSocket(tripId, me, (event) => {
      if (event.type === "CHAT_MESSAGE") {
        const incoming = normalizeMessage(event.payload);

        setMessages((prev) => {
          const index = prev.findIndex(
            (m) => m.id === incoming.id
          );

          // optimistic → delivered
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = {
              ...copy[index],
              status: "delivered",
            };
            return copy;
          }

          return [...prev, incoming];
        });
      }

      if (event.type === "USER_TYPING") {
        setTypingUser(event.payload.name);
      }

      if (event.type === "USER_STOPPED_TYPING") {
        setTypingUser(null);
      }

      if (event.type === "MESSAGE_SEEN") {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === event.payload.messageId
              ? { ...msg, status: "seen" }
              : msg
          )
        );
      }

      if (
        event.type === "CHAT_MESSAGE" &&
        me &&                                  // ensure logged in
        event.payload.senderId !== me.user.id // message is NOT mine
      ) {
        sendSeen(event.payload.id);
      }

      
    });

  /* ---------------- SEND MESSAGE ---------------- */
  function handleSend(text: string) {
    const tempId = crypto.randomUUID();

    const optimistic: Message = {
      id: tempId,
      senderId: me.user.id,
      senderName: me.user.name,
      text,
      timestamp: Date.now(),
      status: "sent",
    };

    setMessages((prev) => [...prev, optimistic]);

    sendMessage({
      ...optimistic,
      senderName: me.user.name,
    });
  }

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!me || messages.length === 0) return;

    const unseen = messages.filter(
      (m) => m.senderId !== me.user.id && m.status !== "seen"
    );

    unseen.forEach((msg) => {
      sendSeen(msg.id);
    });
  }, [messages, me]);

  function handleTyping() {
  if (!me) return;

  // Send USER_TYPING only once
  if (!isTypingRef.current) {
    sendTyping(me);
    isTypingRef.current = true;
  }

  // Reset stop-typing timer
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    sendStopTyping(me);
    isTypingRef.current = false;
  }, 700); // WhatsApp-like delay
}

  return (
    <div className="flex flex-col h-[70vh] bg-slate-900 border border-slate-800 rounded-xl">
      <MessageList messages={messages} myUserId={me?.user?.id} />

      {typingUser && (
        <div className="px-4 pb-1 text-xs text-slate-400">
          {typingUser} is typing…
        </div>
      )}

      <div ref={bottomRef} />

      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={() => {}}
      />
    </div>
  );
}