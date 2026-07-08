"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  encodeCityIds,
  getDailyCityIds,
  getTodayUTCDateString,
  sampleRandomCities,
} from "@/lib/game";

type DifficultyOption = Difficulty | "mixed";

const DIFFICULTY_OPTIONS = [
  { value: "easy" as const, label: "Easy" },
  { value: "medium" as const, label: "Medium" },
  { value: "hard" as const, label: "Hard" },
  { value: "mixed" as const, label: "Mixed" },
];

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
    <PageShell maxWidth="xl">
      <header className="mb-10 text-center">
        <Badge tone="accent" className="mb-4">
          Geography · 5 Rounds · Shareable
        </Badge>
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Globe<span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">Guess</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-white/55">
          Pin cities on a live 3D globe. Closer guesses score higher across
          escalating rounds.
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:grid-rows-[auto_auto]">
        {/* Featured — spans full width on bento */}
        <button
          type="button"
          onClick={startDaily}
          className="group relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.14] via-white/[0.04] to-cyan-500/[0.1] p-6 text-left backdrop-blur-xl transition-all duration-200 ease-out hover:scale-[1.01] hover:border-emerald-400/35 active:scale-[0.99] sm:p-8 lg:col-span-2"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          />
          <Badge tone="easy" className="mb-3">
            {todayUTC} UTC
          </Badge>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Today&apos;s Challenge
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">
            Same 5 cities for everyone today — resets at UTC midnight. Compete on
            an even playing field.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-transform duration-200 group-hover:translate-x-1">
            Play now
            <span aria-hidden>→</span>
          </span>
        </button>

        <Link
          href="/build"
          className="group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-200 ease-out hover:scale-[1.01] hover:border-white/15 hover:bg-white/[0.06] active:scale-[0.99] sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl"
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">
              Custom
            </p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Choose Your Own
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Hand-pick 5 cities and share the challenge link.
            </p>
          </div>
          <span className="text-sm font-medium text-cyan-300/80 transition-transform duration-200 group-hover:translate-x-1">
            Build set →
          </span>
        </Link>

        <Card variant="glass" glow="cyan" className="flex flex-col p-6 sm:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">
              Quick Play
            </p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Random Challenge
            </h2>
            <p className="mt-2 text-sm text-white/55">
              5 random cities by difficulty — link is shareable.
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">
              Difficulty
            </p>
            <SegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-6"
            onClick={startRandom}
          >
            Start Challenge
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
