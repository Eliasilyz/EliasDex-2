import React from "react";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { levelFromXp } from "@/lib/xp";

interface LevelBadgeProps {
  level?: number;
  xp?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "text-zinc-500",
  1: "text-gray-400",
  2: "text-gray-300",
  3: "text-slate-300",
  4: "text-blue-300",
  5: "text-sky-300",
  6: "text-cyan-300",
  7: "text-teal-300",
  8: "text-emerald-300",
  9: "text-green-300",
  10: "text-lime-300",
  11: "text-yellow-300",
  12: "text-amber-300",
  13: "text-orange-300",
  14: "text-orange-400",
  15: "text-red-300",
  16: "text-pink-300",
  17: "text-pink-400",
  18: "text-fuchsia-400",
  19: "text-purple-400",
  20: "text-violet-400",
};

const SIZE_CONFIG: Record<"sm" | "md" | "lg", { size: string; text: string; badge: string }> = {
  sm: { size: "w-6 h-6", text: "text-xs", badge: "px-1.5 py-0.5 rounded" },
  md: { size: "w-7 h-7", text: "text-xs", badge: "px-2 py-0.5 rounded-md" },
  lg: { size: "w-8 h-8", text: "text-xs", badge: "px-2.5 py-1 rounded-md" },
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  xp,
  size = "md",
  showIcon = true,
  showText = true,
  className,
}) => {
  const computedLevel = level ?? (xp !== undefined ? levelFromXp(xp) : 0);
  const config = SIZE_CONFIG[size];
  const colorClass = LEVEL_COLORS[Math.min(computedLevel, 20)] || LEVEL_COLORS[0];
  const bgGradient =
    computedLevel >= 10
      ? "from-yellow-500/20 via-orange-500/20 to-red-500/20"
      : computedLevel >= 5
      ? "from-blue-500/20 via-cyan-500/20 to-emerald-500/20"
      : "from-zinc-700/20 via-zinc-600/20 to-zinc-500/20";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 font-semibold border transition-colors",
        bgGradient,
        `border-${computedLevel >= 10 ? "yellow" : "zinc"}-500/30`,
        config.badge,
        colorClass,
        className
      )}
      title={`Level ${computedLevel}`}
    >
      {showIcon && (
        <span
          className={cn(
            "rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr",
            colorClass,
            config.size
          )}
        >
          {computedLevel > 0 ? (
            <Star className={`w-3 h-3 ${size === "lg" ? "w-4 h-4" : ""} fill-current`} />
          ) : (
            <Sparkles className={`w-2.5 h-2.5 ${size === "lg" ? "w-3 h-3" : ""} opacity-50`} />
          )}
        </span>
      )}
      {showText && <span className={config.text}>Lv. {computedLevel}</span>}
    </span>
  );
};
