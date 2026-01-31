import { prisma } from "../lib/prisma";
import { Place } from "./place.types";
import { broadcastToTrip } from "../realtime/broadcast";


export async function addPlace({
  tripId,
  day,
  name,
  latitude,
  longitude,
  createdBy,
}: {
  tripId: string;
  day: number;
  name: string;
  latitude: number;
  longitude: number;
  createdBy: string;
}): Promise<Place> {
  const dayPlacesCount = await prisma.place.count({
    where: { tripId, day },
  });

  const newPlace = await prisma.place.create({
    data: {
      tripId,
      day,
      name,
      latitude,
      longitude,
      order: dayPlacesCount + 1,
      createdBy,
    },
  });

  broadcastToTrip(tripId, {
    type: "PLACE_ADDED",
    place: newPlace,
  });
  return newPlace;
}

export async function reorderPlacesInDay({
  tripId,
  day,
  orderedPlaceIds,
}: {
  tripId: string;
  day: number;
  orderedPlaceIds: string[];
}) {
  const dayPlaces = await prisma.place.findMany({
    where: { tripId, day },
    orderBy: { order: "asc" },
  });

  if (dayPlaces.length !== orderedPlaceIds.length) {
    throw new Error("INVALID_REORDER_PAYLOAD");
  }

  const transaction = orderedPlaceIds.map((id, index) => {
    return prisma.place.update({
      where: { id },
      data: { order: index + 1 },
    });
  });

  await prisma.$transaction(transaction);

  return getPlacesByTrip(tripId);
}

/**
 * Move place to another day (append or insert)
 */
export async function movePlaceToDay({
  tripId,
  placeId,
  targetDay,
  targetOrder,
}: {
  tripId: string;
  placeId: string;
  targetDay: number;
  targetOrder?: number;
}) {
  const place = await prisma.place.findUnique({
    where: { id: placeId, tripId },
  });
  if (!place) throw new Error("PLACE_NOT_FOUND");

  const oldDay = place.day;

  // Remove from old day and reindex
  await prisma.place.updateMany({
    where: {
      tripId,
      day: oldDay,
      order: { gt: place.order },
    },
    data: {
      order: { decrement: 1 },
    },
  });

  // Prepare target day
  if (!targetOrder || targetOrder > (await prisma.place.count({ where: { tripId, day: targetDay } }))) {
    // append
    const newOrder = (await prisma.place.count({ where: { tripId, day: targetDay } })) + 1;
    await prisma.place.update({
      where: { id: placeId },
      data: { day: targetDay, order: newOrder },
    });
  } else {
    // insert at position
    await prisma.place.updateMany({
      where: {
        tripId,
        day: targetDay,
        order: { gte: targetOrder },
      },
      data: {
        order: { increment: 1 },
      },
    });
    await prisma.place.update({
      where: { id: placeId },
      data: { day: targetDay, order: targetOrder },
    });
  }

  return getPlacesByTrip(tripId);
}

export async function getPlacesByTrip(tripId: string) {
  return prisma.place.findMany({
    where: { tripId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
  });
}