import { TripSocketProvider } from "@/context/TripSocketContext";

export default function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tripId: string };
}) {
  return (
    <TripSocketProvider tripId={params.tripId}>
      {children}
    </TripSocketProvider>
  );
}
