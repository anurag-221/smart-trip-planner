export type NotificationType = "MEMBER_APPROVED" | "MEMBER_DECLINED" | "TRIP_INVITE" | "MEMBER_REMOVED";

export interface CreateNotificationPayload {
  userId: string;
  tripId?: string;
  type: NotificationType;
  message: string;
}