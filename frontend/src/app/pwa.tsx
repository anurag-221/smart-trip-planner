"use client";

import { useEffect, useState } from "react";

interface PushSubscriptionResponse {
  publicKey: string;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PWARegister() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(async (registration) => {
          if ("sync" in registration) {
            (registration as any).sync.register("sync-notifications");
          }

          // Push Notification Subscription Logic
          if ("PushManager" in window) {
            const res = await fetch("/api/notifications/vapid-public-key");
            const { publicKey }: PushSubscriptionResponse = await res.json();
            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });

            // Send subscription to your backend
            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(subscription),
            });
            console.log("Push subscription sent to backend.");
          }
        });
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UNREAD_COUNT_UPDATE") {
          setUnreadCount(event.data.payload);
        }
      });
    }
  }, []);

  // You might want to expose unreadCount via a Context API or similar for other components
  return null;
}