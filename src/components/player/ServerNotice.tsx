import React, { useState } from 'react';
import { Info, X, ShieldAlert, Sparkles } from 'lucide-react';

export const ServerNotice: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`relative p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-200/90 flex items-start gap-3 ${className}`}
    >
      <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-orange-100">
          Streaming Tips & Controls
        </p>
        <p className="text-ink-300 leading-relaxed text-xs">
          If the video is slow or buffering, switch between <span className="text-white font-medium">Zoko</span>, <span className="text-white font-medium">MegaPlay</span>, and <span className="text-white font-medium">Backup servers</span> above. You can toggle SUB / DUB anytime.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-ink-500 hover:text-ink-300 p-1 rounded-lg cursor-pointer"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
