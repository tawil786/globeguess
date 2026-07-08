"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { City } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
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
  getScoreEmoji,
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

function PlayAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
      <div className="absolute -right-1/4 top-1/3 h-[360px] w-[360px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
    </div>
  );
}

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
    const roundLine = results
      .map((r) => `${r.baseScore}${getScoreEmoji(r.baseScore)}`)
      .join(" ");
    const text = [
      roundLine,
      `Final score: ${totalScore}/${MAX_POSSIBLE_SCORE}`,
      challengeUrl,
    ].join("\n");
    copyToClipboard(text, "Results copied!");
  }, [results, totalScore, challengeUrl, copyToClipboard]);

  if (roundCities.length !== GAME_ROUNDS) {
    return (
      <>
        <PlayAmbient />
        <div className="flex flex-1 items-center justify-center text-white/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            <span className="text-sm font-medium">Loading challenge…</span>
          </div>
        </div>
      </>
    );
  }

  if (isFinished) {
    return (
      <>
        <PlayAmbient />
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 pb-safe pt-6 sm:px-8 sm:pt-8">
          <header className="text-center">
            <Badge tone="accent" className="mb-3">
              Challenge Complete
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              Final Score
            </h1>
            <p className="mt-2 font-display text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                {totalScore}
              </span>
              <span className="text-2xl font-semibold text-white/35">
                {" "}
                / {MAX_POSSIBLE_SCORE}
              </span>
            </p>
          </header>

          <Card variant="glass" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3 text-right">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={r.city.id}
                      className="border-b border-white/[0.04] transition-colors duration-200 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 text-white/40">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-white">
                          {r.city.name}
                        </span>
                        <span className="ml-1.5 text-white/40">
                          {r.city.country}
                        </span>
                        <p className="mt-0.5 text-xs text-white/35">
                          {r.roundLabel} · {r.multiplier}x
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-display text-xl font-bold tracking-tight text-cyan-200">
                          {r.baseScore}{" "}
                          <span className="text-lg">
                            {getScoreEmoji(r.baseScore)}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-white/45">
                          {r.finalScore} pts ({r.baseScore} × {r.multiplier})
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-white/70">
                        {formatDistance(r.distanceKm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-auto flex flex-col gap-3 pb-2">
            <Button variant="primary" size="lg" fullWidth onClick={copyResults}>
              Copy results
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={copyChallengeLink}
            >
              Copy challenge link
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              fullWidth
              onClick={() => router.push("/")}
            >
              Back to home
            </Button>
          </div>

          {copyFeedback && <Toast message={copyFeedback} />}
        </div>
      </>
    );
  }

  const roundLabel = getRoundLabel(roundIndex);
  const roundMultiplier = getRoundMultiplier(roundIndex);

  return (
    <>
      <PlayAmbient />
      <div className="flex min-h-dvh flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-safe sm:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">
                Round {roundIndex + 1}/{GAME_ROUNDS}
              </Badge>
              <Badge tone="accent">
                {roundLabel} · {roundMultiplier}x
              </Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-white/55">
              Score{" "}
              <span className="font-semibold text-emerald-300">
                {totalScore}
              </span>
              <span className="text-white/35"> / {MAX_POSSIBLE_SCORE}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyChallengeLink}
            className="shrink-0"
          >
            Copy link
          </Button>
        </header>

        <div className="shrink-0 px-5 pb-4 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            Find this city
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-cyan-200 to-violet-300 bg-clip-text text-transparent">
              {currentCity.name}
            </span>
            <span className="text-white/50">, {currentCity.country}</span>
          </h1>
          {!revealed && (
            <p className="mt-2 text-sm text-white/45">
              Tap the globe to lock in your guess
            </p>
          )}
        </div>

        <div className="relative mx-5 min-h-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_16px_48px_-16px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:mx-8 h-[60vh]">
          <Globe
            onGuess={handleGuess}
            guessMarker={revealed ? lockedGuess : null}
            actualMarker={
              revealed ? { lat: currentCity.lat, lng: currentCity.lng } : null
            }
            interactive={!revealed}
          />
        </div>

        <div className="shrink-0 px-5 pb-safe pt-4 sm:px-8">
          {revealed && lastResult && (
            <Card variant="glass" glow="cyan" className="p-5 sm:p-6">
              <p className="text-sm font-medium text-white/55">
                {formatDistance(lastResult.distanceKm)}{" "}
                <span className="text-white/35">away</span>
              </p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                  {lastResult.baseScore}
                </span>{" "}
                <span className="text-3xl">
                  {getScoreEmoji(lastResult.baseScore)}
                </span>
              </p>
              <p className="mt-2 text-sm text-white/50">
                {lastResult.finalScore} pts this round ({lastResult.baseScore} ×{" "}
                {lastResult.multiplier}, {lastResult.roundLabel})
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-5"
                onClick={nextRound}
              >
                {isLastRound ? "See results" : "Next round"}
              </Button>
            </Card>
          )}
        </div>

        {copyFeedback && <Toast message={copyFeedback} />}
      </div>
    </>
  );
}

export default function PlayPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-white/50">
            <div className="h-8 w-8 animate-pulse rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
          </div>
        }
      >
        <PlayContent />
      </Suspense>
    </div>
  );
}
