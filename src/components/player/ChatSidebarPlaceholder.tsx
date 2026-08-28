import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatSidebarPlaceholderProps {
  className?: string;
}

export const ChatSidebarPlaceholder: React.FC<ChatSidebarPlaceholderProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px] lg:min-h-[480px] ${className}`}
      aria-label="Global chat placeholder"
    >
      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-zinc-500" />
      </div>
      <div className="space-y-1.5 max-w-[200px]">
        <h4 className="text-sm font-semibold text-zinc-200">Global Chat</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Coming in Phase 4 — chat with other viewers while you watch.
        </p>
      </div>
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        Phase 4
      </div>
    </div>
  );
};
