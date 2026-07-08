import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "md" | "lg" | "xl" | "full";
};

const maxWidthStyles = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

export function PageShell({
  children,
  className,
  maxWidth = "lg",
}: PageShellProps) {
  return (
    <div className={cn("relative flex min-h-dvh flex-1 flex-col", className)}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute -right-1/4 top-1/4 h-[480px] w-[480px] rounded-full bg-violet-600/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
      </div>

      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-5 pb-safe pt-6 sm:px-8 sm:pt-10",
          maxWidthStyles[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  );
}
