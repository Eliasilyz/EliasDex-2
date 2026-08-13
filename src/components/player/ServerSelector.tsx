import React from 'react';
import { Server, Zap } from 'lucide-react';
import { STREAM_SERVERS, StreamServerOption } from '../../lib/stream';
import { StreamSource } from '../../types';

interface ServerSelectorProps {
  selectedSource: StreamSource;
  onSelectSource: (source: StreamSource) => void;
  className?: string;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  selectedSource,
  onSelectSource,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
        <Server className="w-3.5 h-3.5 text-orange-400" />
        <span>Stream Servers:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STREAM_SERVERS.map((server) => {
          const isSelected = selectedSource === server.source;
          return (
            <button
              key={server.id}
              id={`server-btn-${server.id}`}
              type="button"
              onClick={() => onSelectSource(server.source)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
              }`}
              title={server.description}
            >
              <Zap className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-zinc-500'}`} />
              <span>{server.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
