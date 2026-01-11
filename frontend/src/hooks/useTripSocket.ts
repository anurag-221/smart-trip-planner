"use client";

import { useEffect, useRef } from "react";
import { connectTripSocket } from "@/lib/websocket";
import { Message } from "@/components/chat/Chat";

type WSEvent =
  | { type: "CHAT_MESSAGE"; payload: Message }
  | { type: "USER_JOINED"; payload: { user: string } }
  | { type: "USER_LEFT"; payload: { user: string } }
  | { type: "USER_TYPING"; payload: { user: string } }
  | { type: "USER_STOPPED_TYPING"; payload: { user: string } };

export function useTripSocket(
  tripId: string,
  onEvent: (event: WSEvent) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // ✅ Allow reconnect if previous socket was closed
    if (socketRef.current) return;

    const socket = connectTripSocket(tripId);
    socketRef.current = socket;

    socket.onopen = () => {
      isConnectedRef.current = true;
      console.log("🟢 WS connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data?.type) return;
        onEvent(data);
      } catch (err) {
        console.error("WS message error", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WS error", err);
    };

    socket.onclose = () => {
      console.log("🔴 WS closed");
      socketRef.current = null;
      isConnectedRef.current = false;
    };

    return () => {
      // ✅ Only close if actually connected
      if (isConnectedRef.current) {
        socket.close();
      }
    };
  }, [tripId, onEvent]);

  function sendMessage(message: Message) {
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
  }

  function sendTyping(user: string) {
  if (
    socketRef.current &&
    socketRef.current.readyState === WebSocket.OPEN
  ) {
    socketRef.current.send(
      JSON.stringify({
        type: "USER_TYPING",
        payload: { user },
      })
    );
  }
}

function sendStopTyping(user: string) {
  if (
    socketRef.current &&
    socketRef.current.readyState === WebSocket.OPEN
  ) {
    socketRef.current.send(
      JSON.stringify({
        type: "USER_STOPPED_TYPING",
        payload: { user },
      })
    );
  }
}


  return { sendMessage, sendTyping, sendStopTyping };
}