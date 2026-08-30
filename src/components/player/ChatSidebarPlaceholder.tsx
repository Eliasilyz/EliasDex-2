import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatSidebarPlaceholderProps {
  className?: string;
}

export const ChatSidebarPlaceholder: React.FC<ChatSidebarPlaceholderProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-ink-500/60 bg-surface-canvas/40 p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px] lg:min-h-[480px] ${className}`}
      aria-label="Global chat placeholder"
    >
      <div className="w-10 h-10 rounded-xl bg-ink-700/80 border border-ink-500/60 flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-ink-500" />
      </div>
      <div className="space-y-1.5 max-w-[200px]">
        <h4 className="text-sm font-semibold text-ink-300">Global Chat</h4>
        <p className="text-xs text-ink-500 leading-relaxed">
          Coming in Phase 4 — chat with other viewers while you watch.
        </p>
      </div>
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink-700/60 border border-ink-500/50 text-xs font-mono uppercase tracking-wider text-ink-500">
        Phase 4
      </div>
    </div>
  );
};
