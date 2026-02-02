"use client";

import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useMe } from "@/hooks/useMe";
import { UsersIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTripContext } from "@/context/TripSocketContext";
import { apiFetch } from "@/lib/api";
import { Message } from "@/types/chat.types";

export default function Chat({ tripId }: { tripId: string }) {
  const { 
      messages, 
      members, 
      onlineUserIds, 
      typingUser, 
      sendMessage, 
      sendTyping, 
      sendStopTyping, 
      sendSeen,
      handleRemoveUser: contextRemoveUser,
      addMessageOptimistically
  } = useTripContext();

  const [showNewMsg, setShowNewMsg] = useState(false);
  const [showConnectedUsers, setShowConnectedUsers] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const me = useMe();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  /* ---------------- OWNER CHECK ---------------- */
  useEffect(() => {
    async function checkIsOwner() {
      if (!me?.user) return;
      try {
        const trip = await apiFetch<{ ownerId: string }>(`/trips/${tripId}`);
        setIsOwner(trip.ownerId === me.user.id);
      } catch (err) {
        console.error("Failed to check if owner", err);
      }
    }
    checkIsOwner();
  }, [tripId, me?.user?.id]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /* ---------------- SEND MESSAGES ---------------- */
  function handleSend(text: string) {
    if (!me?.user) return;
    const tempId = crypto.randomUUID();

    const optimistic: Message = {
      id: tempId,
      senderId: me.user.id,
      senderName: me.user.name,
      text,
      timestamp: Date.now(),
      status: "sent",
      senderColor: "#000", // Context handles colors but optimistic needs one. 
      // Ideally move color logic to shared util or context helper if strictly needed immediately
    };

    addMessageOptimistically(optimistic);
  }

  /* ---------------- TYPING ---------------- */
  function handleTyping() {
    if (!me?.user) return;

    // Send USER_TYPING only once
    if (!isTypingRef.current) {
      sendTyping(me as any);
      isTypingRef.current = true;
    }

    // Reset stop-typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(me as any);
      isTypingRef.current = false;
    }, 700); 
  }

  /* ---------------- SEEN ---------------- */
  useEffect(() => {
    if (!me || messages.length === 0) return;

    const unseen = messages.filter(
      (m) => m.senderId !== me.user.id && m.status !== "seen"
    );

    unseen.forEach((msg) => {
      sendSeen(msg.id);
    });
  }, [messages, me, sendSeen]);

  /* ---------------- SCROLL UI ---------------- */
  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 60; // px
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    if(isAtBottomRef.current){
      setShowNewMsg(false);
    }
  }

  function scrollToBottom(smooth = true) {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }

  useEffect(() => {
    if (messages.length === 0) return;
    // Initial open → instant scroll if just loaded
    if (messages.length > 0) scrollToBottom(false);
  }, []); // Only on mount? Messages might be empty initially though due to async context load.

  // Better: Scroll to bottom when messages change IF we were at bottom
  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom(true);
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] md:h-[70dvh] bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900 z-10 relative">
        <h2 className="text-lg font-semibold text-white">Trip Chat</h2>
        <button
          onClick={() => setShowConnectedUsers(!showConnectedUsers)}
          className="p-2 rounded-full text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Show connected users"
        >
          <UsersIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Connected Users Sidebar/Popover */}
      {showConnectedUsers && (
        <>
            {/* Backdrop for mobile */}
            <div 
                className="absolute inset-0 bg-black/50 z-20 md:hidden"
                onClick={() => setShowConnectedUsers(false)}
            />
            
            <div className="absolute inset-y-0 right-0 w-80 bg-slate-800 z-30 p-4 border-l border-slate-700 shadow-2xl transform transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Members ({members.length})</h3>
                <button
                onClick={() => setShowConnectedUsers(false)}
                className="p-1 rounded-full text-white hover:bg-slate-700"
                aria-label="Close connected users"
                >
                <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(100%-4rem)]">
                <ul className="space-y-3">
                    {members.map((user) => (
                    <li key={user.userId} className="flex items-center justify-between text-white group">
                        <div className="flex items-center gap-2">
                             <div className="relative shrink-0">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase" style={{ backgroundColor: user.displayColor }}>
                                        {user.name[0]}
                                    </div>
                                )}
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-slate-800 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-slate-500'}`} title={user.isOnline ? "Online" : "Offline"} />
                             </div>
                             <div className="flex flex-col min-w-0">
                                <span className={`leading-tight text-sm truncate ${user.isOnline ? "font-medium" : "text-slate-400"}`}>
                                    {user.name} 
                                    {me?.user?.id === user.userId && <span className="text-slate-500 text-[10px] ml-1">(You)</span>}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono truncate">{user.userId}</span>
                             </div>
                        </div>
                        
                        {isOwner && me?.user?.id !== user.userId && (
                        <button
                            onClick={() => contextRemoveUser(user.userId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-500/20 text-red-500 hover:text-red-400 disabled:opacity-50"
                            title="Remove user"
                            aria-label="Remove user"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                        )}
                    </li>
                    ))}
                </ul>
            </div>
            </div>
        </>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <MessageList messages={messages} myUserId={me?.user?.id} />
        <div ref={bottomRef} />
      </div>

      {typingUser && (
        <div className="px-4 pb-1 text-xs text-slate-400">
          {typingUser} is typing…
        </div>
      )}

      {showNewMsg && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-20 left-1/2 -translate-x-1/2
                    bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow z-10"
        >
          New message ↓
        </button>
      )}

      <div
        className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-2 z-10 relative"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          onStopTyping={() => {}}
        />
      </div>
    </div>
  );
}