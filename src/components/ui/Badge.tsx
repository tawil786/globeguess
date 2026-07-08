import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeTone = "easy" | "medium" | "hard" | "neutral" | "accent";

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

const toneStyles: Record<BadgeTone, string> = {
  easy: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  hard: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  neutral: "border-white/10 bg-white/[0.05] text-white/60",
  accent: "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
