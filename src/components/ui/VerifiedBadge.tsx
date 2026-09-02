import React from "react";
import { cn } from "@/lib/utils";

export const VerifiedBadge: React.FC<{
  className?: string;
  tooltip?: boolean;
}> = ({ className, tooltip = true }) => {
  return (
    <span className={cn("group/badge relative inline-flex items-center", className)}>
      <span
        className="inline-flex items-center justify-center rounded-full bg-green-500/15 text-green-400 shrink-0"
        title={tooltip ? "Verified account" : undefined}
        aria-label="Verified account"
      >
        <svg
          className="w-3.5 h-3.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1.5l1.9 2.05 2.8-.43.9 2.68 2.68.9-.43 2.8L23 12l-2.05 1.9.43 2.8-2.68.9-.9 2.68-2.8-.43L12 22.5l-1.9-2.05-2.8.43-.9-2.68-2.68-.9.43-2.8L1 12l2.05-1.9-.43-2.8 2.68-.9.9-2.68 2.8.43L12 1.5zM10.9 15.2l-2.3-2.3 1.4-1.4.9.9 3.1-3.1 1.4 1.4-4.5 4.5z"
          />
        </svg>
        <span className="sr-only">Verified</span>
      </span>
      {tooltip && (
        <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/badge:inline-block whitespace-nowrap rounded-md bg-ink-950 border border-ink-700 px-2 py-0.5 text-[10px] font-medium text-surface-primary shadow-xl">
          Verified account
        </span>
      )}
    </span>
  );
};