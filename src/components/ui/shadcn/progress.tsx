import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-zinc-800", className)}
        {...props}
      >
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
