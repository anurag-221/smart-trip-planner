export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  isPublic: boolean;
};

export type TripRole = "owner" | "collaborator" | "viewer";
export type MemberStatus = "pending" | "approved";