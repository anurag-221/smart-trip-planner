"use client";

import { Message } from "./Chat";

export default function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No messages yet
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        // ✅ SYSTEM MESSAGE (centered)
        if (msg.sender === "system") {
          return (
            <div key={msg.id} className="text-center text-xs text-slate-500">
              {msg.text}
            </div>
          );
        }

        const isMe = msg.sender === "You";

        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 text-sm shadow
                ${
                  isMe
                    ? "bg-emerald-600 text-white rounded-l-lg rounded-tr-lg"
                    : "bg-slate-800 text-white rounded-r-lg rounded-tl-lg"
                }
              `}
            >
              {!isMe && (
                <p className="text-[11px] text-slate-300 mb-1">{msg.sender}</p>
              )}
                  <p>{msg.text}</p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/80">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {msg.status === "sent" && <span>✓</span>}
                    {msg.status === "delivered" && <span>✓✓</span>}
                    {msg.status === "seen" && (
                      <span className="text-blue-200">✓✓</span>
                    )}
                  </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}