"use client";

import { useEffect, useRef } from "react";
import { connectTripSocket } from "@/lib/websocket";
import { Message } from "@/components/chat/Chat";

type UserTypingPayload = {
  userId: string;
  name: string;
};

type WSEvent =
  | { type: "CHAT_MESSAGE"; payload: Message }
  | { type: "USER_JOINED"; payload: { user: string } }
  | { type: "USER_LEFT"; payload: { user: string } }
  | { type: "USER_TYPING"; payload: UserTypingPayload }
  | { type: "USER_STOPPED_TYPING"; payload: UserTypingPayload }
  | { type: "MESSAGE_SEEN", payload: {messageId: string; seenBy: string} };

export function useTripSocket(
  tripId: string,
  me: { user: {id: string; name: string} } | null,
  onEvent: (event: WSEvent) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!tripId) return;
    if (!me) return;

    if (socketRef.current) return;

    const socket = connectTripSocket(tripId, me);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WS connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEventRef.current(data);
      } catch {}
    };

    socket.onerror = (e) => {
      console.error("❌ WS error", e);
    };

    socket.onclose = () => {
      console.log("🔴 WS closed");
      socketRef.current = null;
    };

    return () => {
      // do NOT aggressively close in StrictMode
    };
  }, [tripId, me]);

  // ✅ ALWAYS RETURN FUNCTIONS (even if socket not ready)
  const sendMessage = (message: Message) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "CHAT_MESSAGE",
          payload: message,
        })
      );
    }
  };

  const sendTyping = (me: { user: { id: string; name: string }}) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "USER_TYPING",
          payload: { userId: me.user.id, name: me.user.name},
        })
      );
    }
  };

  const sendStopTyping = (me: { user: { id: string; name: string }}) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "USER_STOPPED_TYPING",
          payload: { userId: me.user.id, name: me.user.name },
        })
      );
    }
  };

  const sendSeen = (messageId: string) => {
  if (
    socketRef.current &&
    socketRef.current.readyState === WebSocket.OPEN
  ) {
    socketRef.current.send(
      JSON.stringify({
        type: "MESSAGE_SEEN",
        payload: {
          messageId,
          seenBy: me!.user.id,
        },
      })
    );
  }
}


  return {
    sendMessage,
    sendTyping,
    sendStopTyping,
    sendSeen,
  };
}