import React, { useState } from 'react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import {
 Play,
 Pause,
 SkipForward,
 SkipBack,
 Volume2,
 VolumeX,
 X,
 ChevronUp,
 ChevronDown,
 Tv,
 Music,
 Disc3,
 Repeat,
 Repeat1,
 Shuffle,
 ExternalLink,
 Youtube,
 ListMusic,
 Radio,
} from 'lucide-react';

export const GlobalMusicPlayer: React.FC = () => {
 const {
  currentTrack,
  playlist,
  isPlaying,
  isLoading,
  isMinimized,
  showVideoModal,
  playbackMode,
  playTrack,
  togglePlay,
  nextTrack,
  prevTrack,
  closePlayer,
  toggleMinimize,
  setShowVideoModal,
  setPlaybackMode,
 } = useMusicPlayer();

 const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);

 if (!currentTrack) return null;

 const isOpening = currentTrack.type === 'OP';
 const hasMultiple = playlist.length > 1;

 const handleToggleMode = () => {
  if (playbackMode === 'loop') setPlaybackMode('loop-one');
  else if (playbackMode === 'loop-one') setPlaybackMode('shuffle');
  else setPlaybackMode('loop');
 };

 return (
  <>
   {/* 1. Embedded YouTube Audio/Video Stream Iframe (Always mounted when track is active so audio plays continuously) */}
   <div className={showVideoModal ? 'hidden' : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 pointer-events-none opacity-0 overflow-hidden'}>
    {currentTrack.embedUrl && (
     <iframe
      key={currentTrack.id + (currentTrack.videoId || '')}
      src={currentTrack.embedUrl}
      title={currentTrack.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      className="w-1 h-1"
     />
    )}
   </div>

   {/* 2. Floating Bottom Music Player Bar */}
   <div
    id="global-music-player-bar"
    className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl transition-all duration-300 ${
     isMinimized ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`}
   >
    <div className="bg-surface-canvas border border-border-subtle shadow-2xl rounded-2xl p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-surface-primary ring-1 ring-white/10">
     {/* Left Track Info */}
     <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
      {/* Spinning Vinyl / Poster */}
      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-surface-canvas shrink-0 border border-ink-500 flex items-center justify-center group shadow-md">
       {currentTrack.animePoster ? (
        <img
         src={currentTrack.animePoster}
         alt={currentTrack.animeTitle}
         referrerPolicy="no-referrer"
         className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform`}
        />
       ) : (
        <Disc3 className={`w-6 h-6 text-orange-400 audio-live ${isPlaying ? 'animate-spin' : ''}`} style={{ '--audio-dur': '4s' } as React.CSSProperties} />
       )}

       {/* Center Play Indicator */}
       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        {isLoading ? (
         <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
         /* Equalizer Bar Animation */
         <div className="flex items-end gap-0.5 h-4">
          <span className="w-1 bg-orange-400 rounded-full audio-live animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '70%', '--audio-dur': '0.8s' } as React.CSSProperties} />
          <span className="w-1 bg-orange-400 rounded-full audio-live animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '100%', '--audio-dur': '0.6s' } as React.CSSProperties} />
          <span className="w-1 bg-orange-400 rounded-full audio-live animate-[bounce_1s_ease-in-out_infinite]" style={{ height: '40%', '--audio-dur': '1s' } as React.CSSProperties} />
         </div>
        ) : (
         <Music className="w-4 h-4 text-ink-300" />
        )}
       </div>
      </div>

      {/* Title, Artist, and Badges */}
      <div className="min-w-0 flex-1">
       <div className="flex items-center gap-2">
        <span
         className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider shrink-0 ${
          isOpening
           ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
           : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
         }`}
        >
         {currentTrack.type} #{currentTrack.number}
        </span>

        <h4 className="text-xs sm:text-sm font-bold text-surface-primary truncate hover:text-orange-400 transition-colors">
         {currentTrack.title}
        </h4>
       </div>

       <div className="flex items-center gap-2 text-xs text-ink-500 truncate mt-0.5">
        <span className="text-ink-300 truncate">{currentTrack.artist}</span>
        <span>•</span>
        <span className="text-ink-500 truncate">{currentTrack.animeTitle}</span>
       </div>
      </div>
     </div>

     {/* Mobile Bottom Controls Group (wraps controls + right actions in one row on small screens) */}
     <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
       {/* Playback Mode (Loop / Shuffle) */}
       <button
        type="button"
        onClick={handleToggleMode}
        title={`Mode: ${playbackMode}`}
        className="p-1.5 rounded-lg text-ink-500 hover:text-white hover:bg-ink-700 transition-colors cursor-pointer"
       >
        {playbackMode === 'loop' && <Repeat className="w-3.5 h-3.5 text-ink-300" />}
        {playbackMode === 'loop-one' && <Repeat1 className="w-3.5 h-3.5 text-orange-400" />}
        {playbackMode === 'shuffle' && <Shuffle className="w-3.5 h-3.5 text-orange-400" />}
       </button>

       {/* Prev Track */}
       <button
        type="button"
        onClick={prevTrack}
        disabled={!hasMultiple}
        className={`p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-700 transition-colors cursor-pointer ${
         !hasMultiple ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        title="Previous Track"
       >
        <SkipBack className="w-4 h-4 fill-current" />
       </button>

       {/* Main Play/Pause Button */}
       <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-700 text-white flex items-center justify-center shadow-lg  active:scale-95 transition-all cursor-pointer"
        title={isPlaying ? 'Pause' : 'Play'}
       >
        {isLoading ? (
         <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
         <Pause className="w-3.5 h-3.5 fill-white" />
        ) : (
         <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
        )}
       </button>

       {/* Next Track */}
       <button
        type="button"
        onClick={nextTrack}
        disabled={!hasMultiple}
        className={`p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-700 transition-colors cursor-pointer ${
         !hasMultiple ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        title="Next Track"
       >
        <SkipForward className="w-4 h-4 fill-current" />
       </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
       {/* Playlist Drawer Button */}
       {playlist.length > 1 && (
        <button
         type="button"
         onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
         className={`p-1.5 sm:p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
          showPlaylistDrawer
           ? 'bg-orange-600 text-white border-orange-500'
           : 'bg-surface-canvas border-border-subtle text-ink-300 hover:text-white'
         }`}
         title="Playlist Tracks"
        >
         <ListMusic className="w-3.5 h-3.5" />
         <span className="hidden sm:inline text-xs">{playlist.length}</span>
        </button>
       )}

       {/* Watch Video Mode Button */}
       <button
        type="button"
        onClick={() => setShowVideoModal(true)}
        className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 hover:text-orange-300 text-xs sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Watch Anime Opening / Ending Video"
       >
        <Tv className="w-3.5 h-3.5" />
        <span className="hidden xs:inline text-xs">Video MV</span>
       </button>

       {/* Close Button */}
       <button
        type="button"
        onClick={closePlayer}
        className="p-1.5 rounded-lg text-ink-500 hover:text-white hover:bg-ink-700 transition-colors cursor-pointer"
        title="Close Player"
       >
        <X className="w-4 h-4" />
       </button>
      </div>
     </div>
    </div>

    {/* Playlist Quick Drawer */}
    {showPlaylistDrawer && playlist.length > 1 && (
     <div data-lenis-prevent className="mt-2 bg-surface-canvas border border-ink-700 rounded-2xl p-3 shadow-2xl space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between pb-1.5 border-b border-ink-700 text-xs text-ink-500">
       <span className="font-semibold text-ink-300">Theme Songs Queue</span>
       <span>{playlist.length} Tracks</span>
      </div>
      {playlist.map((t) => {
       const isCurrent = t.id === currentTrack.id;
       return (
        <button
         key={t.id}
         type="button"
         onClick={() => playTrack(t)}
         className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
          isCurrent
           ? 'bg-orange-600 text-white font-bold'
           : 'hover:bg-surface-canvas text-ink-300'
         }`}
        >
         <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-mono opacity-80 uppercase px-1.5 py-0.5 rounded bg-black/30">
           {t.type} #{t.number}
          </span>
          <span className="text-xs truncate">{t.title}</span>
         </div>
         <span className="text-xs opacity-75 truncate max-w-[120px] ml-2">
          {t.artist}
         </span>
        </button>
       );
      })}
     </div>
    )}
   </div>

   {/* 3. Minimized Floating Button (if user collapsed it) */}
   {isMinimized && (
    <button
     type="button"
     onClick={toggleMinimize}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-2xl bg-orange-700 hover:bg-orange-600 text-white shadow-2xl flex items-center gap-2 transition-transform cursor-pointer border border-orange-500"
     title="Restore Theme Song Player"
    >
     <Disc3 className="w-5 h-5 animate-spin audio-live" />
     <span className="text-xs font-bold max-w-[120px] truncate">{currentTrack.title}</span>
    </button>
   )}

   {/* 4. Expanded Video / Animation Modal */}
   {showVideoModal && (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
     <div className="relative w-full max-w-3xl bg-surface-canvas border border-ink-700 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ink-700/80 bg-surface-canvas/60">
       <div className="flex items-center gap-2.5 min-w-0">
        <span
         className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
          isOpening
           ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
           : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
         }`}
        >
         {currentTrack.type} #{currentTrack.number}
        </span>
        <div className="min-w-0">
         <h3 className="text-sm font-bold text-surface-primary truncate">{currentTrack.title}</h3>
         <p className="text-xs text-ink-500 truncate">
          {currentTrack.artist} • {currentTrack.animeTitle}
         </p>
        </div>
       </div>

       <div className="flex items-center gap-2">
        <button
         type="button"
         onClick={() => setShowVideoModal(false)}
         className="p-2 rounded-xl bg-ink-700 hover:bg-ink-500 text-ink-300 hover:text-white transition-colors cursor-pointer"
         title="Close Video"
        >
         <X className="w-4 h-4" />
        </button>
       </div>
      </div>

      {/* 16:9 Video Player */}
      <div className="relative aspect-video w-full bg-black">
       {currentTrack.embedUrl ? (
        <iframe
         key={currentTrack.id + (currentTrack.videoId || '')}
         src={currentTrack.embedUrl}
         title={currentTrack.title}
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
         allowFullScreen
         className="w-full h-full border-0"
        />
       ) : (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-ink-500">
         <Tv className="w-10 h-10" />
         <p className="text-xs">Loading theme song video stream...</p>
        </div>
       )}
      </div>

      {/* Footer with Song Navigation */}
      <div className="p-4 bg-surface-canvas/60 border-t border-ink-700 flex items-center justify-between">
       <div className="flex items-center gap-2">
        <button
         type="button"
         onClick={prevTrack}
         disabled={!hasMultiple}
         className={`px-3 py-1.5 rounded-xl bg-ink-700 hover:bg-ink-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
          !hasMultiple ? 'opacity-40 cursor-not-allowed' : ''
         }`}
        >
         <SkipBack className="w-3.5 h-3.5" />
         <span>Previous</span>
        </button>

        <button
         type="button"
         onClick={nextTrack}
         disabled={!hasMultiple}
         className={`px-3 py-1.5 rounded-xl bg-ink-700 hover:bg-ink-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
          !hasMultiple ? 'opacity-40 cursor-not-allowed' : ''
         }`}
        >
         <span>Next Song</span>
         <SkipForward className="w-3.5 h-3.5" />
        </button>
       </div>

       <div className="flex items-center gap-2">
        <a
         href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.query)}`}
         target="_blank"
         rel="noreferrer"
         className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold inline-flex items-center gap-1.5 border border-red-800/40 transition-colors"
        >
         <Youtube className="w-3.5 h-3.5 fill-red-400" />
         <span>Open on YouTube</span>
        </a>
       </div>
      </div>
     </div>
    </div>
   )}
  </>
 );
};
