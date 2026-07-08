import { cn } from "@/lib/cn";

type ToastProps = {
  message: string;
  className?: string;
};

export function Toast({ message, className }: ToastProps) {
  return (
    <p
      role="status"
      className={cn(
        "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full",
        "border border-white/10 bg-slate-900/90 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-xl",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_24px_-4px_rgba(34,211,238,0.2)]",
        "toast-enter",
        className
      )}
    >
      {message}
    </p>
  );
}
