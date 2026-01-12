export type Message = {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  type: "text" | "image" | "file";
  text?: string;
  fileUrl?: string;
  timestamp: number;
};