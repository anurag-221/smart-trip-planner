// utils/date.ts
export function formatDateLabel(timestamp: number) {
  const msgDate = new Date(timestamp);
  const today = new Date();

  const isToday =
    msgDate.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    msgDate.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return msgDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}