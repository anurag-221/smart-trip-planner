"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import DaySection from "./DaySection";
import { API_BASE } from "@/config/urls";

type Place = {
  id: string;
  name: string;
  day: number;
  latitude: number;
  longitude: number;
  order: number;
};

type Day = {
  id: string;
  title: string;
  places: Place[];
};

export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    const fetchItinerary = async () => {
      const res = await fetch(`${API_BASE}/trips/${tripId}/places`, {
        credentials: "include",
      });
      const fetchedPlaces: Place[] = await res.json();

      const groupedDays: { [key: number]: Place[] } = {};
      fetchedPlaces?.forEach((place) => {
        if (!groupedDays[place.day]) {
          groupedDays[place.day] = [];
        }
        groupedDays[place.day].push(place);
      });

      const newDays: Day[] = Object.keys(groupedDays)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((dayNum) => ({
          id: `day-${dayNum}`,
          title: `Day ${dayNum}`,
          places: groupedDays[parseInt(dayNum)].sort((a, b) => a.order - b.order),
        }));

      if (newDays.length === 0) {
        setDays([
          {
            id: "day-1",
            title: "Day 1",
            places: [],
          },
        ]);
      } else {
        setDays(newDays);
      }
    };

    fetchItinerary();
  }, [tripId]);

  function addDay() {
    const nextDay = days.length > 0 ? Math.max(...days.map(d => parseInt(d.id.split('-')[1]))) + 1 : 1;
    setDays((prev) => [
      ...prev,
      {
        id: `day-${nextDay}`,
        title: `Day ${nextDay}`,
        places: [],
      },
    ]);
    // TODO: Potentially save new day to backend if days are also persisted
  }

  async function addPlace(dayId: string, placeName: string) {
    const dayNum = parseInt(dayId.split('-')[1]);
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/places`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          day: dayNum,
          name: placeName,
          latitude: 0, // Placeholder, ideally get from a map input
          longitude: 0, // Placeholder, ideally get from a map input
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add place");
      }

      const newPlace: Place = await res.json();

      setDays((prev) =>
        prev.map((day) =>
          day.id === dayId
            ? {
                ...day,
                places: [...day.places, newPlace].sort((a,b) => a.order - b.order),
              }
            : day
        )
      );
    } catch (error: any) {
      console.error("Error adding place:", error.message);
      // Optionally show a toast error
    }
  }

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <DaySection
          key={day.id}
          day={day}
          onAddPlace={addPlace}
        />
      ))}

      <button
        onClick={addDay}
        className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition"
      >
        + Add another day
      </button>
    </div>
  );
}