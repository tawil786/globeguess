"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/data/cities";
import {
  encodeCityIds,
  getDailyCityIds,
  getTodayUTCDateString,
  sampleRandomCities,
} from "@/lib/game";

type DifficultyOption = Difficulty | "mixed";

export default function HomePage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<DifficultyOption>("mixed");
  const todayUTC = useMemo(() => getTodayUTCDateString(), []);

  const startDaily = () => {
    const ids = getDailyCityIds(todayUTC);
    const encoded = encodeCityIds(ids);
    router.push(`/play?cities=${encodeURIComponent(encoded)}`);
  };

  const startRandom = () => {
    const sampled = sampleRandomCities(difficulty);
    const encoded = encodeCityIds(sampled.map((c) => c.id));
    router.push(`/play?cities=${encodeURIComponent(encoded)}`);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-safe pt-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          GlobeGuess
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          Tap the globe. How close can you get?
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4">
        <button
          type="button"
          onClick={startDaily}
          className="flex min-h-[120px] flex-col justify-center rounded-2xl border border-emerald-700/50 bg-emerald-950/40 px-6 py-5 text-left active:bg-emerald-950/70"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500/80">
            {todayUTC} UTC
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Today&apos;s Challenge
          </h2>
          <p className="mt-1 text-sm text-emerald-200/70">
            Same 5 cities for everyone today — resets at UTC midnight
          </p>
        </button>

        <Link
          href="/build"
          className="flex min-h-[120px] flex-col justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 active:bg-zinc-800"
        >
          <h2 className="text-xl font-semibold text-white">
            Choose Your Own
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Pick 5 cities and share the challenge link
          </p>
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Random Challenge</h2>
          <p className="mt-1 text-sm text-zinc-400">
            5 random cities by difficulty — link is shareable
          </p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["easy", "Easy"],
                  ["medium", "Medium"],
                  ["hard", "Hard"],
                  ["mixed", "Mixed"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-medium ${
                    difficulty === value
                      ? "bg-sky-600 text-white"
                      : "bg-zinc-800 text-zinc-300 active:bg-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={startRandom}
            className="mt-6 w-full min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
