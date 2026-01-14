import { Check, CheckCheck } from "lucide-react";

export function MessageStatus({
  status,
}: {
  status?: "sent" | "delivered" | "seen";
}) {
  if (!status) return null;

  if (status === "sent") {
    return <Check size={14} className="text-tick-sent" />;
  }

  if (status === "delivered") {
    return <CheckCheck size={14} className="text-tick-delivered" />;
  }

  return <CheckCheck size={14} className="text-tick-seen" />;
}