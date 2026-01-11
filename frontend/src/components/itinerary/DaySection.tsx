"use client";

import { useState } from "react";

type Place = {
  id: string;
  name: string;
};

type Day = {
  id: string;
  title: string;
  places: Place[];
};

export default function DaySection({
  day,
  onAddPlace,
}: {
  day: Day;
  onAddPlace: (dayId: string, placeName: string) => void;
}) {
  const [newPlace, setNewPlace] = useState("");

  function handleAdd() {
    if (!newPlace.trim()) return;
    onAddPlace(day.id, newPlace);
    setNewPlace("");
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <h3 className="font-semibold">{day.title}</h3>

      {/* Places */}
      {day.places.length === 0 && (
        <p className="text-sm text-slate-500">
          No places added yet
        </p>
      )}

      <ul className="space-y-2">
        {day.places.map((place) => (
          <li
            key={place.id}
            className="p-2 rounded bg-slate-800 text-sm"
          >
            📍 {place.name}
          </li>
        ))}
      </ul>

      {/* Add place */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPlace}
          onChange={(e) => setNewPlace(e.target.value)}
          placeholder="Add place"
          className="flex-1 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-emerald-600 rounded text-sm hover:bg-emerald-500"
        >
          Add
        </button>
      </div>
    </div>
  );
}