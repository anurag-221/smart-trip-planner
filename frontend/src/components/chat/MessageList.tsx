"use client";

import { Message } from "./Chat";

export default function MessageList({
  messages,
}: {
  messages: Message[];
}) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No messages yet
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
            msg.sender === "You"
              ? "ml-auto bg-emerald-600"
              : "bg-slate-800"
          }`}
        >
          <p className="font-medium text-xs mb-1">
            {msg.sender}
          </p>
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
}