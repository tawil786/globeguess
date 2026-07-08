import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "relative overflow-hidden border border-cyan-400/30 bg-gradient-to-br from-cyan-500 via-sky-500 to-violet-600",
    "text-white font-semibold shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]",
    "hover:scale-[1.02] hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.6)] hover:border-cyan-300/50",
    "active:scale-[0.98]"
  ),
  secondary: cn(
    "border border-white/10 bg-white/[0.04] backdrop-blur-md text-white/90 font-medium",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    "hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
    "active:scale-[0.98]"
  ),
  tertiary: cn(
    "text-white/60 font-medium",
    "hover:scale-[1.01] hover:bg-white/[0.06] hover:text-white/90",
    "active:scale-[0.98]"
  ),
  ghost: cn(
    "border border-white/10 bg-white/[0.03] text-white/70 text-sm font-medium",
    "hover:scale-[1.02] hover:border-cyan-400/30 hover:bg-white/[0.06] hover:text-white",
    "active:scale-[0.98]"
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3.5 py-2 text-xs rounded-xl",
  md: "min-h-12 px-5 py-3 text-sm rounded-xl",
  lg: "min-h-14 px-6 py-3.5 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14]",
        "disabled:pointer-events-none disabled:opacity-40",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
