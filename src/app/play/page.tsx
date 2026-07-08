"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { City } from "@/data/cities";
import {
  decodeCityIds,
  formatDistance,
  GAME_ROUNDS,
  getRoundLabel,
  getRoundMultiplier,
  haversineDistance,
  isValidGameCityCount,
  lookupCities,
  MAX_POSSIBLE_SCORE,
  roundScore,
  scoreEmoji,
} from "@/lib/game";
import type { LatLng } from "@/types/geo";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

type RoundResult = {
  city: City;
  guess: LatLng;
  distanceKm: number;
  baseScore: number;
  multiplier: number;
  finalScore: number;
  roundLabel: string;
};

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citiesParam = searchParams.get("cities") ?? "";

  const roundCities = useMemo(() => {
    const ids = decodeCityIds(citiesParam);
    if (!isValidGameCityCount(ids.length)) return [];
    return lookupCities(ids);
  }, [citiesParam]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lockedGuess, setLockedGuess] = useState<LatLng | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const challengeUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/play?cities=${encodeURIComponent(citiesParam)}`;
  }, [citiesParam]);

  useEffect(() => {
    const ids = decodeCityIds(citiesParam);
    if (!isValidGameCityCount(ids.length) || roundCities.length !== GAME_ROUNDS) {
      router.replace("/");
    }
  }, [citiesParam, roundCities.length, router]);

  const currentCity = roundCities[roundIndex];
  const isFinished =
    roundCities.length === GAME_ROUNDS && roundIndex >= GAME_ROUNDS;
  const isLastRound = roundIndex === GAME_ROUNDS - 1;

  const handleGuess = useCallback(
    (lat: number, lng: number) => {
      if (revealed || isFinished || roundCities.length !== GAME_ROUNDS || !currentCity)
        return;

      const guess = { lat, lng };
      const distanceKm = haversineDistance(
        lat,
        lng,
        currentCity.lat,
        currentCity.lng
      );
      const { baseScore, multiplier, finalScore } = roundScore(
        distanceKm,
        roundIndex
      );

      const result: RoundResult = {
        city: currentCity,
        guess,
        distanceKm,
        baseScore,
        multiplier,
        finalScore,
        roundLabel: getRoundLabel(roundIndex),
      };

      setLockedGuess(guess);
      setLastResult(result);
      setRevealed(true);
      setTotalScore((s) => s + finalScore);
      setResults((prev) => [...prev, result]);
    },
    [revealed, isFinished, roundCities.length, currentCity, roundIndex]
  );

  const nextRound = useCallback(() => {
    setRoundIndex((i) => i + 1);
    setLockedGuess(null);
    setRevealed(false);
    setLastResult(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback("Copy failed");
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }, []);

  const copyChallengeLink = useCallback(
    () => copyToClipboard(challengeUrl, "Link copied!"),
    [challengeUrl, copyToClipboard]
  );

  const copyResults = useCallback(() => {
    const emojiBar = results.map((r) => scoreEmoji(r.finalScore)).join("");
    const lines = results.map(
      (r, i) =>
        `${i + 1}. ${r.city.name}, ${r.city.country} — ${r.roundLabel} — ${formatDistance(r.distanceKm)} — ${r.baseScore} × ${r.multiplier} = ${r.finalScore} pts`
    );
    const text = [
      "🌍 GlobeGuess Challenge",
      `${emojiBar}  ${totalScore} / ${MAX_POSSIBLE_SCORE}`,
      "",
      ...lines,
      "",
      challengeUrl,
    ].join("\n");
    copyToClipboard(text, "Results copied!");
  }, [results, totalScore, challengeUrl, copyToClipboard]);

  if (roundCities.length !== GAME_ROUNDS) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Loading…
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 pb-safe pt-4">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-white">Challenge Complete</h1>
          <p className="mt-1 text-3xl font-semibold text-emerald-400">
            {totalScore} / {MAX_POSSIBLE_SCORE}
          </p>
        </header>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Diff</th>
                <th className="px-3 py-2 text-right">Distance</th>
                <th className="px-3 py-2 text-right">Base</th>
                <th className="px-3 py-2 text-right">×</th>
                <th className="px-3 py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={r.city.id}
                  className="border-b border-zinc-800/60 last:border-0"
                >
                  <td className="px-3 py-2.5 text-zinc-500">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-white">{r.city.name}</span>
                    <span className="ml-1 text-zinc-500">{r.city.country}</span>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-400">{r.roundLabel}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-300">
                    {formatDistance(r.distanceKm)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-300">
                    {r.baseScore}
                  </td>
                  <td className="px-3 py-2.5 text-right text-zinc-400">
                    {r.multiplier}x
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-emerald-400">
                    {r.finalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex flex-col gap-3 pb-2">
          <button
            type="button"
            onClick={copyResults}
            className="min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
          >
            Copy results
          </button>
          <button
            type="button"
            onClick={copyChallengeLink}
            className="min-h-12 rounded-xl border border-zinc-700 px-4 py-3 text-base font-medium text-zinc-200 active:bg-zinc-800"
          >
            Copy challenge link
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-12 rounded-xl px-4 py-3 text-base text-zinc-400 active:text-white"
          >
            Back to home
          </button>
        </div>

        {copyFeedback && (
          <p className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg">
            {copyFeedback}
          </p>
        )}
      </div>
    );
  }

  const roundLabel = getRoundLabel(roundIndex);
  const roundMultiplier = getRoundMultiplier(roundIndex);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-safe">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Round {roundIndex + 1} of {GAME_ROUNDS} · {roundLabel} ·{" "}
            {roundMultiplier}x
          </p>
          <p className="text-sm font-medium text-emerald-400">
            Score: {totalScore} / {MAX_POSSIBLE_SCORE}
          </p>
        </div>
        <button
          type="button"
          onClick={copyChallengeLink}
          className="min-h-10 shrink-0 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 active:bg-zinc-800"
        >
          Copy link
        </button>
      </header>

      <div className="shrink-0 px-4 pb-3">
        <h1 className="text-xl font-bold text-white">
          Find:{" "}
          <span className="text-sky-300">
            {currentCity.name}, {currentCity.country}
          </span>
        </h1>
        {!revealed && (
          <p className="mt-1 text-sm text-zinc-500">
            Tap the globe to lock in your guess
          </p>
        )}
      </div>

      <div className="relative h-[60vh] min-h-[280px] w-full shrink-0">
        <Globe
          onGuess={handleGuess}
          guessMarker={revealed ? lockedGuess : null}
          actualMarker={
            revealed ? { lat: currentCity.lat, lng: currentCity.lng } : null
          }
          interactive={!revealed}
        />
      </div>

      <div className="shrink-0 px-4 pb-safe pt-3">
        {revealed && lastResult && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/90 p-4">
            <p className="text-lg font-semibold text-white">
              {formatDistance(lastResult.distanceKm)} away —{" "}
              <span className="text-emerald-400">
                {lastResult.finalScore} points
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Base score {lastResult.baseScore} × {lastResult.multiplier} (
              {lastResult.roundLabel})
            </p>
            <button
              type="button"
              onClick={nextRound}
              className="mt-4 w-full min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
            >
              {isLastRound ? "See results" : "Next"}
            </button>
          </div>
        )}
      </div>

      {copyFeedback && (
        <p className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg">
          {copyFeedback}
        </p>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-zinc-400">
            Loading…
          </div>
        }
      >
        <PlayContent />
      </Suspense>
    </div>
  );
}
