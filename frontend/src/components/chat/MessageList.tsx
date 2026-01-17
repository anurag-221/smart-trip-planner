"use client";

import { Message } from "./Chat";
import { MessageStatus } from "./MessageStatus";
import { formatDateLabel } from "@/lib/date";

export default function MessageList({ messages, myUserId }: { messages: Message[], myUserId?: string }) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No messages yet
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {messages.map((msg, index) => {
        // ✅ SYSTEM MESSAGE (centered)
        const isMe = msg.senderId === myUserId;
        const prev = messages[index - 1];
        const showDateDivider = !prev || formatDateLabel(prev.timestamp) !== formatDateLabel(msg.timestamp)

        return (
          <div key={msg.id}>
            {showDateDivider && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300">
                  {formatDateLabel(msg.timestamp)}
                </span>
              </div>
            )}
            <div
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 text-sm rounded-lg shadow
                  ${
                    isMe
                      ? "bg-chat-me text-white rounded-br-none"
                      : "bg-chat-other text-white rounded-bl-none"
                  }
                `}
              >
                {!isMe && (
                  <p className="text-[11px] text-slate-300 mb-1">{msg.senderName}</p>
                )}
                    <p>{msg.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/80">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    {isMe && msg.status && (
                      <MessageStatus status={msg.status} />
                    )}
                    </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}