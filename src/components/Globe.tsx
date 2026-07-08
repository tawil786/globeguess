"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LatLng } from "@/types/geo";

const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

const EARTH_TEXTURE_URL = "/textures/earth-blue-marble.jpg";

export type { LatLng } from "@/types/geo";

type GlobeProps = {
  onGuess: (lat: number, lng: number) => void;
  guessMarker?: LatLng | null;
  actualMarker?: LatLng | null;
  interactive?: boolean;
};

type PointDatum = LatLng & { kind: "guess" | "actual" };
type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

export default function Globe({
  onGuess,
  guessMarker,
  actualMarker,
  interactive = true,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onGuessRef = useRef(onGuess);
  onGuessRef.current = onGuess;

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    if (w > 0 && h > 0) {
      setSize({ width: w, height: h });
    }
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(el);

    const raf = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [measure]);

  const handleGlobeClick = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (!interactive) return;
      onGuessRef.current(coords.lat, coords.lng);
    },
    [interactive]
  );

  const pointsData = useMemo(() => {
    const points: PointDatum[] = [];
    if (guessMarker) points.push({ ...guessMarker, kind: "guess" });
    if (actualMarker) points.push({ ...actualMarker, kind: "actual" });
    return points;
  }, [guessMarker, actualMarker]);

  const arcsData = useMemo((): ArcDatum[] => {
    if (!guessMarker || !actualMarker) return [];
    return [
      {
        startLat: guessMarker.lat,
        startLng: guessMarker.lng,
        endLat: actualMarker.lat,
        endLng: actualMarker.lng,
      },
    ];
  }, [guessMarker, actualMarker]);

  const ready = size.width > 0 && size.height > 0;

  return (
    <div ref={containerRef} className="absolute inset-0 touch-none">
      {ready && (
        <GlobeGL
          width={size.width}
          height={size.height}
          backgroundColor="#050508"
          globeImageUrl={EARTH_TEXTURE_URL}
          showAtmosphere
          atmosphereColor="#1a3a5c"
          atmosphereAltitude={0.12}
          onGlobeClick={handleGlobeClick}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d) =>
            (d as PointDatum).kind === "guess" ? "#f97316" : "#22c55e"
          }
          pointRadius={0.6}
          pointAltitude={0.02}
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ["#f97316", "#22c55e"]}
          arcAltitude={0.15}
          arcStroke={1.2}
        />
      )}
    </div>
  );
}
