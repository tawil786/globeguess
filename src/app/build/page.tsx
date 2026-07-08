"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cities, type City } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/cn";
import {
  encodeCityIds,
  GAME_ROUNDS,
  getRoundLabel,
  getRoundMultiplier,
} from "@/lib/game";

function difficultyTone(
  difficulty: City["difficulty"]
): "easy" | "medium" | "hard" {
  return difficulty;
}

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
    <PageShell maxWidth="lg" className="pb-28">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center text-sm font-medium text-white/50 transition-all duration-200 ease-out hover:translate-x-[-2px] hover:text-white/90"
        >
          ← Back
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
          Choose Your Own
        </h1>
        <p className="mt-1.5 text-sm text-white/55">
          Select {GAME_ROUNDS} cities in order ·{" "}
          <span className="font-medium text-cyan-300/90">
            {selected.length}/{GAME_ROUNDS}
          </span>
        </p>
      </header>

      <Input
        type="search"
        placeholder="Search by city or country…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-5"
      />

      {selected.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {selected.map((city, i) => (
            <button
              key={city.id}
              type="button"
              onClick={() => toggleCity(city)}
              className="group flex min-h-10 items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1.5 text-sm text-cyan-100 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-cyan-500/15 active:scale-[0.98]"
            >
              <span className="font-semibold text-cyan-300">{i + 1}</span>
              <span className="font-medium text-white/90">{city.name}</span>
              <Badge tone="accent" className="!px-2 !py-0 text-[10px]">
                {getRoundLabel(i)} · {getRoundMultiplier(i)}x
              </Badge>
              <span className="text-white/40 transition-colors group-hover:text-white/70">
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
                className={cn(
                  "flex w-full min-h-[52px] items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ease-out",
                  isSelected
                    ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_24px_-8px_rgba(34,211,238,0.25)]"
                    : disabled
                      ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] opacity-40"
                      : "border-white/[0.06] bg-white/[0.03] hover:scale-[1.005] hover:border-white/12 hover:bg-white/[0.06] active:scale-[0.995]"
                )}
              >
                <div>
                  <span className="font-medium text-white">{city.name}</span>
                  <span className="ml-2 text-sm text-white/45">
                    {city.country}
                  </span>
                </div>
                <Badge
                  tone={
                    isSelected
                      ? "accent"
                      : difficultyTone(city.difficulty)
                  }
                >
                  {isSelected
                    ? `${getRoundLabel(order)} · ${getRoundMultiplier(order)}x`
                    : city.difficulty}
                </Badge>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/[0.06] bg-[#070b14]/80 px-5 pb-safe pt-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto max-w-2xl">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={selected.length !== GAME_ROUNDS}
            onClick={startGame}
          >
            Start ({selected.length}/{GAME_ROUNDS})
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
