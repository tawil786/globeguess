import { cn } from "@/lib/cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm",
        className
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
              active
                ? "scale-[1.02] border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-white shadow-[0_0_20px_-4px_rgba(34,211,238,0.3)]"
                : "border border-transparent text-white/50 hover:scale-[1.01] hover:bg-white/[0.05] hover:text-white/80 active:scale-[0.98]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
