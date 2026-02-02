"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useMe } from "@/hooks/useMe";
import { useTripSocket } from "@/hooks/useTripSocket";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Message } from "@/types/chat.types";

export type ConnectedUser = {
  userId: string;
  name: string;
  isOnline: boolean;
  displayColor?: string;
  image?: string | null;
};

interface TripSocketContextType {
  messages: Message[];
  members: ConnectedUser[];
  onlineUserIds: Set<string>;
  typingUser: string | null;
  sendMessage: (msg: Message) => void;
  sendTyping: (me: { user: { id: string; name: string } }) => void;
  sendStopTyping: (me: { user: { id: string; name: string } }) => void;
  sendSeen: (messageId: string) => void;
  handleRemoveUser: (userId: string) => Promise<void>;
  addMessageOptimistically: (msg: Message) => void;
}

const TripSocketContext = createContext<TripSocketContextType | null>(null);

const USER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", 
  "#A2D9CE", "#BB8FCE", "#F5B041", "#82E0AA",
];

function stringToColor(str: string) {
  if (!str) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash % USER_COLORS.length);
  return USER_COLORS[colorIndex];
}

function normalizeMessage(raw: any, members: ConnectedUser[] = []): Message {
  let image = raw.sender?.image ?? raw.senderImage;
  let name = raw.sender?.name ?? raw.senderName ?? raw.sender; // raw.sender might be string name in some legacy cases?

  if (members.length > 0) {
      const sender = members.find(m => m.userId === (raw.senderId ?? "unknown"));
      if (sender) {
          if (!image) image = sender.image;
          if (!name || name === "Unknown") name = sender.name;
      }
  }

  return {
    id: raw.id,
    senderId: raw.senderId ?? "unknown",
    senderName: name ?? "Unknown",
    text: raw.text ?? "",
    timestamp: typeof raw.timestamp === "number" ? raw.timestamp : new Date(raw.createdAt ?? Date.now()).getTime(),
    status: raw.status ?? "delivered",
    senderColor: stringToColor(raw.senderId ?? "unknown"),
    senderImage: image, 
  };
}

export function TripSocketProvider({ 
  tripId, 
  children 
}: { 
  tripId: string; 
  children: ReactNode 
}) {
  const router = useRouter();
  const me = useMe();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ConnectedUser[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    if (!tripId) return;

    async function loadData() {
        try {
            const [msgsData, membersData, connectedData] = await Promise.all([
                apiFetch<any[]>(`/trips/${tripId}/messages`),
                apiFetch<any[]>(`/trips/${tripId}/members`),
                apiFetch<any[]>(`/trips/${tripId}/connected-users`)
            ]);

            const normalizedMsgs = msgsData.map(m => ({
                id: m.id,
                senderId: m.senderId,
                senderName: m.senderName,
                text: m.text ?? "",
                timestamp: m.timestamp,
                status: "delivered" as const,
                senderColor: stringToColor(m.senderId ?? "unknown"),
                senderImage: m.senderImage ?? m.sender?.image // Map image from backend
            }));
            setMessages(normalizedMsgs);

            const mappedMembers = membersData.map((m: any) => ({
                userId: m.user.id,
                name: m.user.name,
                isOnline: false,
                displayColor: stringToColor(m.user.id),
                image: m.user.image,
            }));
            setMembers(mappedMembers);

            const ids = new Set(connectedData.map((u: any) => u.userId));
            if (me?.user) ids.add(me.user.id);
            setOnlineUserIds(ids);

        } catch (err) {
            console.error("Failed to load trip data", err);
        }
    }

    loadData();
  }, [tripId, me?.user?.id]);

  // Sync online status
  useEffect(() => {
      setMembers(prev => prev.map(m => ({
          ...m,
          isOnline: onlineUserIds.has(m.userId) || m.userId === me?.user?.id
      })));
  }, [onlineUserIds, me?.user?.id]);

  // Socket Hook
  const { sendMessage, sendTyping, sendStopTyping, sendSeen } = useTripSocket(tripId, me, (event) => {
      console.log("WS Event in Context:", event.type);
      
      if (event.type === "CHAT_MESSAGE") {
          const incoming = normalizeMessage(event.payload, members);
          setMessages(prev => {
              const idx = prev.findIndex(m => m.id === incoming.id);
              if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], status: "delivered" };
                  return copy;
              }
              return [...prev, incoming];
          });
      }
      else if (event.type === "USER_JOINED") {
          setOnlineUserIds(prev => {
              const next = new Set(prev);
              next.add(event.payload.userId);
              return next;
          });
          setMembers(prev => {
              if (!prev.some(m => m.userId === event.payload.userId)) {
                  // If we don't have full details, we add basic placeholder until reload or dedicated fetch
                  // But usually we should have them. 
                   return [...prev, {
                      userId: event.payload.userId,
                      name: event.payload.name,
                      isOnline: true,
                      displayColor: stringToColor(event.payload.userId)
                  }];
              }
              return prev;
          });
      }
      else if (event.type === "USER_LEFT") {
           setOnlineUserIds(prev => {
              const next = new Set(prev);
              next.delete(event.payload.userId);
              return next;
          });
      }
      else if (event.type === "MEMBER_REMOVED") {
           if (event.payload.userId === me?.user?.id) {
               toast.error("You have been removed from this trip.");
               router.push("/trips");
               return;
           }
           setMembers(prev => prev.filter(m => m.userId !== event.payload.userId));
           setOnlineUserIds(prev => {
               const next = new Set(prev);
               next.delete(event.payload.userId);
               return next;
           });
           toast.info(`${event.payload.name} was removed from the trip.`);
      }
      else if (event.type === "MEMBER_APPROVED") {
          setMembers(prev => {
              if (!prev.some(m => m.userId === event.payload.userId)) {
                  const user = event.payload.user;
                  return [...prev, {
                      userId: user.id,
                      name: user.name,
                      isOnline: false,
                      displayColor: stringToColor(user.id),
                      image: (user as any).image 
                  }];
              }
              return prev;
          });
      }
      else if (event.type === "USER_TYPING") {
          setTypingUser(event.payload.name);
      }
      else if (event.type === "USER_STOPPED_TYPING") {
          setTypingUser(null);
      }
      else if (event.type === "MESSAGE_SEEN") {
          setMessages(prev => prev.map(msg => 
              msg.id === event.payload.messageId ? { ...msg, status: "seen" } : msg
          ));
      }

      // Auto-seen logic if chat is open/active? 
      // Handled in Chat component or here? 
      // Ideally here if we knew if Chat was active. For now, leave explicit seen sending to Chat component.
      if (event.type === "CHAT_MESSAGE" && me && event.payload.senderId !== me.user.id) {
          // We can expose a function to mark as seen
      }
  });

  const handleRemoveUser = async (userIdToRemove: string) => {
      if (!confirm("Are you sure you want to remove this user from the trip?")) return;
      try {
        await apiFetch(`/trips/${tripId}/members/${userIdToRemove}/remove`, { method: "POST" });
        toast.success("User removed successfully!");
        // State update handled by WS event usually, but we can optimistically update too
      } catch (err) {
        console.error("Failed to remove user", err);
        toast.error("Failed to remove user.");
      }
  };

  const addMessageOptimistically = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      sendMessage(msg);
  };

  return (
    <TripSocketContext.Provider value={{
        messages,
        members,
        onlineUserIds,
        typingUser,
        sendMessage,
        sendTyping,
        sendStopTyping,
        sendSeen,
        handleRemoveUser,
        addMessageOptimistically
    }}>
      {children}
    </TripSocketContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripSocketContext);
  if (!ctx) throw new Error("useTripContext must be used within TripSocketProvider");
  return ctx;
}
