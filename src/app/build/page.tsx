"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cities, type City } from "@/data/cities";
import {
  encodeCityIds,
  GAME_ROUNDS,
  getRoundLabel,
  getRoundMultiplier,
} from "@/lib/game";

export default function BuildPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<City[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleCity = (city: City) => {
    setSelected((prev) => {
      const idx = prev.findIndex((c) => c.id === city.id);
      if (idx >= 0) return prev.filter((c) => c.id !== city.id);
      if (prev.length >= GAME_ROUNDS) return prev;
      return [...prev, city];
    });
  };

  const startGame = () => {
    if (selected.length !== GAME_ROUNDS) return;
    const encoded = encodeCityIds(selected.map((c) => c.id));
    router.push(`/play?cities=${encodeURIComponent(encoded)}`);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-safe pt-4">
      <header className="mb-4">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center text-sm text-zinc-400 active:text-white"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Choose Your Own</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Select {GAME_ROUNDS} cities in order ({selected.length}/{GAME_ROUNDS})
        </p>
      </header>

      <input
        type="search"
        placeholder="Search by city or country…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-500 focus:border-sky-600 focus:outline-none"
      />

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((city, i) => (
            <button
              key={city.id}
              type="button"
              onClick={() => toggleCity(city)}
              className="flex min-h-10 items-center gap-1.5 rounded-full bg-sky-900/60 px-3 py-1.5 text-sm text-sky-200 active:bg-sky-900"
            >
              <span className="font-medium text-sky-400">{i + 1}.</span>
              {city.name}
              <span className="text-xs text-sky-400/80">
                {getRoundLabel(i)} · {getRoundMultiplier(i)}x
              </span>
              <span className="text-sky-500">×</span>
            </button>
          ))}
        </div>
      )}

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pb-24">
        {filtered.map((city) => {
          const order = selected.findIndex((c) => c.id === city.id);
          const isSelected = order >= 0;
          const disabled = !isSelected && selected.length >= GAME_ROUNDS;

          return (
            <li key={city.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleCity(city)}
                className={`flex w-full min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-sky-900/40 ring-1 ring-sky-700"
                    : disabled
                      ? "opacity-40"
                      : "bg-zinc-900 active:bg-zinc-800"
                }`}
              >
                <div>
                  <span className="font-medium text-white">{city.name}</span>
                  <span className="ml-2 text-sm text-zinc-500">
                    {city.country}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                    city.difficulty === "easy"
                      ? "bg-emerald-900/60 text-emerald-400"
                      : city.difficulty === "medium"
                        ? "bg-amber-900/60 text-amber-400"
                        : "bg-red-900/60 text-red-400"
                  }`}
                >
                  {isSelected
                    ? `${getRoundLabel(order)} · ${getRoundMultiplier(order)}x`
                    : city.difficulty}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 px-4 pb-safe pt-3 backdrop-blur">
        <button
          type="button"
          disabled={selected.length !== GAME_ROUNDS}
          onClick={startGame}
          className="w-full min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-40 active:bg-emerald-700"
        >
          Start ({selected.length}/{GAME_ROUNDS})
        </button>
      </div>
    </div>
  );
}
