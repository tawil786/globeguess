import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "glass" | "featured" | "interactive";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  glow?: "cyan" | "violet" | "emerald" | "none";
  children: ReactNode;
};

const glowStyles = {
  cyan: "before:bg-cyan-500/20",
  violet: "before:bg-violet-500/20",
  emerald: "before:bg-emerald-500/25",
  none: "before:hidden",
};

const variantStyles: Record<CardVariant, string> = {
  glass: cn(
    "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
    "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
  ),
  featured: cn(
    "rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.04] to-cyan-500/[0.08]",
    "backdrop-blur-xl shadow-[0_12px_48px_-12px_rgba(16,185,129,0.25),inset_0_1px_0_0_rgba(255,255,255,0.08)]"
  ),
  interactive: cn(
    "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl cursor-pointer",
    "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    "transition-all duration-200 ease-out",
    "hover:scale-[1.01] hover:border-white/15 hover:bg-white/[0.06]",
    "hover:shadow-[0_16px_48px_-12px_rgba(34,211,238,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
    "active:scale-[0.99]"
  ),
};

export function Card({
  variant = "glass",
  glow = "none",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:opacity-0 before:blur-2xl before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        glowStyles[glow],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
