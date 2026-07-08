import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-base text-white backdrop-blur-md",
        "placeholder:text-white/35",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        "transition-all duration-200 ease-out",
        "hover:border-white/15 hover:bg-white/[0.06]",
        "focus:border-cyan-400/40 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-cyan-400/20",
        className
      )}
      {...props}
    />
  );
}
