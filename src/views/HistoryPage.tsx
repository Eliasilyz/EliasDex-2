'use client';

import React from 'react';
import { useAppNavigate } from '@/lib/useNavigate';
import { useWatch } from '../context/WatchContext';
import { History, Play, Trash2, Clock, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HistoryPage: React.FC = () => {
  const onNavigate = useAppNavigate();
  const { history, clearHistory, removeFromHistory } = useWatch();

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-600/10 text-orange-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-surface-primary font-heading tracking-tight">
              Watch History
            </h1>
            <p className="text-xs text-ink-500">Resume recently watched anime episodes</p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Clear all watch history?')) {
                clearHistory();
              }
            }}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.malId}
              className="p-3.5 rounded-2xl bg-surface-canvas/60 hover:bg-surface-raised/80 border border-ink-700/80 hover:border-ink-500 flex gap-3.5 transition-all group"
            >
              {/* Poster thumbnail */}
              <div
                onClick={() => onNavigate(`/watch/${item.malId}/${item.episodeNumber}?lang=${item.language}`)}
                className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-surface-raised shrink-0 relative cursor-pointer"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover  transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3
                    onClick={() => onNavigate(`/anime/${item.malId}`)}
                    className="text-[13px] sm:text-sm font-semibold text-surface-primary group-hover:text-orange-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-500">
                    <span className="font-mono font-bold text-orange-400">
                      Episode {item.episodeNumber}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-xs font-semibold text-ink-500">
                      {item.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-ink-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-ink-700/60 mt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/watch/${item.malId}/${item.episodeNumber}?lang=${item.language}`)}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFromHistory(item.malId)}
                    className="text-ink-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
          <History className="w-10 h-10 text-ink-500 mx-auto" />
          <h3 className="text-base font-semibold text-ink-300">No Watch History</h3>
          <p className="text-xs text-ink-500">Episodes you watch will appear here for easy resumption.</p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/')}>
            Start Watching
          </Button>
        </div>
      )}
    </div>
  );
};
