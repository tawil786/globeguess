import { cities, type City, type Difficulty } from "@/data/cities";

const EARTH_RADIUS_KM = 6371;

export const GAME_ROUNDS = 5;
export const ROUND_MULTIPLIERS = [1, 1, 2, 3, 3] as const;
export const MAX_POSSIBLE_SCORE = 1000;

export function getRoundMultiplier(roundIndex: number): number {
  return ROUND_MULTIPLIERS[roundIndex] ?? 1;
}

export function getRoundLabel(roundIndex: number): string {
  const mult = getRoundMultiplier(roundIndex);
  if (mult === 1) return "Easy";
  if (mult === 2) return "Medium";
  return "Hard";
}

export function isValidGameCityCount(count: number): boolean {
  return count === GAME_ROUNDS;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function scoreForDistance(distanceKm: number): number {
  const raw = Math.round(100 * Math.exp(-distanceKm / 2000));
  return Math.max(0, Math.min(100, raw));
}

export function roundScore(
  distanceKm: number,
  roundIndex: number
): { baseScore: number; multiplier: number; finalScore: number } {
  const baseScore = scoreForDistance(distanceKm);
  const multiplier = getRoundMultiplier(roundIndex);
  const finalScore = baseScore * multiplier;
  return { baseScore, multiplier, finalScore };
}

const cityIdSet = new Set(cities.map((c) => c.id));

export function encodeCityIds(ids: string[]): string {
  return ids.filter((id) => cityIdSet.has(id)).join(",");
}

export function decodeCityIds(param: string): string[] {
  if (!param.trim()) return [];
  return param
    .split(",")
    .map((id) => id.trim())
    .filter((id) => cityIdSet.has(id));
}

export function lookupCities(ids: string[]): City[] {
  const byId = new Map(cities.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is City => c !== undefined);
}

function difficultyPool(difficulty: Difficulty): City[] {
  return cities.filter((c) => c.difficulty === difficulty);
}

function shuffleRandom<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function roundSlotCounts(count: number = GAME_ROUNDS): {
  easy: number;
  medium: number;
  hard: number;
} {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  for (let i = 0; i < count; i++) {
    const mult = getRoundMultiplier(i);
    if (mult === 1) easy += 1;
    else if (mult === 2) medium += 1;
    else hard += 1;
  }
  return { easy, medium, hard };
}

export function sampleRandomCities(
  difficulty: Difficulty | "mixed"
): City[] {
  if (difficulty !== "mixed") {
    return shuffleRandom(difficultyPool(difficulty)).slice(0, GAME_ROUNDS);
  }

  const { easy, medium, hard } = roundSlotCounts();
  const easyPick = shuffleRandom(difficultyPool("easy")).slice(0, easy);
  const mediumPick = shuffleRandom(difficultyPool("medium")).slice(0, medium);
  const hardPick = shuffleRandom(difficultyPool("hard")).slice(0, hard);

  let easyIdx = 0;
  let mediumIdx = 0;
  let hardIdx = 0;
  const result: City[] = [];

  for (let i = 0; i < GAME_ROUNDS; i++) {
    const mult = getRoundMultiplier(i);
    if (mult === 1) result.push(easyPick[easyIdx++]);
    else if (mult === 2) result.push(mediumPick[mediumIdx++]);
    else result.push(hardPick[hardIdx++]);
  }

  return result;
}

export function getScoreEmoji(baseScore: number): string {
  if (baseScore >= 100) return "🎯";
  if (baseScore >= 95) return "🔥";
  if (baseScore >= 85) return "🌟";
  if (baseScore >= 70) return "🎉";
  if (baseScore >= 50) return "👍";
  if (baseScore >= 30) return "😅";
  if (baseScore >= 10) return "🤨";
  if (baseScore >= 1) return "😬";
  return "💀";
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${Math.round(km)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

/** Seeded PRNG (mulberry32). Returns a function yielding floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic hash of a "YYYY-MM-DD" string to a numeric seed. */
export function hashDateToSeed(dateStr: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Deterministically pick cities for a UTC date with escalating round difficulty. */
export function getDailyCityIds(dateStr: string, count: number = GAME_ROUNDS): string[] {
  const { easy, medium, hard } = roundSlotCounts(count);
  const rng = mulberry32(hashDateToSeed(dateStr));

  const easyPick = seededShuffle(difficultyPool("easy"), rng).slice(0, easy);
  const mediumPick = seededShuffle(difficultyPool("medium"), rng).slice(0, medium);
  const hardPick = seededShuffle(difficultyPool("hard"), rng).slice(0, hard);

  let easyIdx = 0;
  let mediumIdx = 0;
  let hardIdx = 0;
  const picked: City[] = [];

  for (let i = 0; i < count; i++) {
    const mult = getRoundMultiplier(i);
    if (mult === 1) picked.push(easyPick[easyIdx++]);
    else if (mult === 2) picked.push(mediumPick[mediumIdx++]);
    else picked.push(hardPick[hardIdx++]);
  }

  return picked.map((c) => c.id);
}

export function getTodayUTCDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
