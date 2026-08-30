"use client";

import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { ShadcnButton } from "@/components/ui/shadcn/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold font-heading text-surface-primary">Failed to load episode stream</h2>
        <p className="text-xs text-ink-500 mt-1 max-w-xs">{error.message || "The video player encountered an unexpected error."}</p>
      </div>
      <div className="flex items-center gap-2">
        <ShadcnButton variant="secondary" size="sm" onClick={reset} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </ShadcnButton>
        <ShadcnButton
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/")}
          className="gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </ShadcnButton>
      </div>
    </div>
  );
}
