"use client";

import { useState } from "react";
import DaySection from "./DaySection";

type Place = {
  id: string;
  name: string;
};

type Day = {
  id: string;
  title: string;
  places: Place[];
};

export default function Itinerary() {
  const [days, setDays] = useState<Day[]>([
    {
      id: "day-1",
      title: "Day 1",
      places: [],
    },
  ]);

  function addDay() {
    const nextDay = days.length + 1;
    setDays([
      ...days,
      {
        id: `day-${nextDay}`,
        title: `Day ${nextDay}`,
        places: [],
      },
    ]);
  }

  function addPlace(dayId: string, placeName: string) {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: [
                ...day.places,
                {
                  id: crypto.randomUUID(),
                  name: placeName,
                },
              ],
            }
          : day
      )
    );
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