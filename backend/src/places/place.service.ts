import { v4 as uuid } from "uuid";
import { places } from "./place.store";
import { Place } from "./place.types";
import { broadcastToTrip } from "../realtime/broadcast";


export function addPlace({
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
}): Place {
  const dayPlaces = places.filter(
    (p) => p.tripId === tripId && p.day === day
  );

  const newPlace: Place = {
    id: uuid(),
    tripId,
    day,
    name,
    latitude,
    longitude,
    order: dayPlaces.length + 1,
    createdBy,
  };

  places.push(newPlace);
  broadcastToTrip(tripId, {
  type: "PLACE_ADDED",
  place: newPlace,
});
  return newPlace;
}

/**
 * Reorder places within the same day
 */
export function reorderPlacesInDay({
  tripId,
  day,
  orderedPlaceIds,
}: {
  tripId: string;
  day: number;
  orderedPlaceIds: string[];
}) {
  const dayPlaces = places.filter(
    (p) => p.tripId === tripId && p.day === day
  );

  if (dayPlaces.length !== orderedPlaceIds.length) {
    throw new Error("INVALID_REORDER_PAYLOAD");
  }

  orderedPlaceIds.forEach((id, index) => {
    const place = dayPlaces.find((p) => p.id === id);
    if (!place) throw new Error("PLACE_NOT_FOUND");
    place.order = index + 1;
  });

  return getPlacesByTrip(tripId);
}

/**
 * Move place to another day (append or insert)
 */
export function movePlaceToDay({
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
  const place = places.find(
    (p) => p.tripId === tripId && p.id === placeId
  );
  if (!place) throw new Error("PLACE_NOT_FOUND");

  const oldDay = place.day;

  // Remove from old day and reindex
  const oldDayPlaces = places
    .filter((p) => p.tripId === tripId && p.day === oldDay && p.id !== placeId)
    .sort((a, b) => a.order - b.order);

  oldDayPlaces.forEach((p, idx) => (p.order = idx + 1));

  // Prepare target day
  const targetDayPlaces = places
    .filter((p) => p.tripId === tripId && p.day === targetDay)
    .sort((a, b) => a.order - b.order);

  place.day = targetDay;

  if (!targetOrder || targetOrder > targetDayPlaces.length) {
    // append
    place.order = targetDayPlaces.length + 1;
  } else {
    // insert at position
    targetDayPlaces.forEach((p) => {
      if (p.order >= targetOrder) p.order += 1;
    });
    place.order = targetOrder;
  }

  return getPlacesByTrip(tripId);
}

export function getPlacesByTrip(tripId: string) {
  return places
    .filter((p) => p.tripId === tripId)
    .sort((a, b) => a.day - b.day || a.order - b.order);
}