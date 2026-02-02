export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "seen";
  senderColor?: string;
  senderImage?: string | null;
};
