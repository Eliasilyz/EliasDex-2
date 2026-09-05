import React, { useState } from 'react';
import { AnimeTrailer } from '../../types';
import { Play, Youtube, ExternalLink, Film, Volume2, Maximize2 } from 'lucide-react';

interface TrailerSectionProps {
 trailer?: AnimeTrailer;
 title: string;
 posterImage?: string;
}

export const TrailerSection: React.FC<TrailerSectionProps> = ({
 trailer,
 title,
 posterImage,
}) => {
 const [isPlaying, setIsPlaying] = useState(false);

 // Extract youtube ID or embed URL
 const youtubeId = trailer?.youtube_id;
 const embedUrl = trailer?.embed_url || (youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1` : null);
 const watchUrl = trailer?.url || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);
 const thumbnailUrl =
 trailer?.images?.maximum_image_url ||
 trailer?.images?.large_image_url ||
 trailer?.images?.medium_image_url ||
 posterImage;

 if (!embedUrl && !youtubeId && !watchUrl) {
 return (
  <div className="text-center py-12 px-4 rounded-2xl bg-surface-canvas/30 border border-ink-700/80 space-y-2">
  <Film className="w-8 h-8 text-ink-500 mx-auto" />
  <p className="text-sm font-semibold text-ink-300">No official trailer available</p>
  <p className="text-xs text-ink-500">Official promotional video has not been linked for this anime.</p>
  </div>
 );
 }

 return (
 <div className="space-y-4">
  {/* Video Container */}
   <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black group">
  {isPlaying && embedUrl ? (
   <iframe
   src={embedUrl.includes('autoplay=1') ? embedUrl : `${embedUrl}&autoplay=1`}
   title={`${title} Official Trailer`}
   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
   allowFullScreen
   className="w-full h-full border-0"
   />
  ) : (
   <div className="relative w-full h-full">
   {/* Thumbnail Poster */}
   {thumbnailUrl ? (
    <img
    src={thumbnailUrl}
    alt={`${title} Trailer Thumbnail`}
    referrerPolicy="no-referrer"
    className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-500"
    />
   ) : (
    <div className="w-full h-full bg-surface-canvas flex items-center justify-center">
    <Film className="w-16 h-16 text-ink-500" />
    </div>
   )}

   {/* Gradient Overlay */}
   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

   {/* Centered Play Button */}
   <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
    <button
    type="button"
    id="play-trailer-btn"
    onClick={() => setIsPlaying(true)}
     className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-700 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group/btn"
    aria-label="Play official trailer"
    >
    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
    </button>

    <div className="text-center px-4">
    <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md block">
     Watch Official Trailer
    </span>
    <span className="text-xs sm:text-xs text-ink-300 drop-shadow">
     High-Definition Promotional Video
    </span>
    </div>
   </div>

   {/* Badges */}
   <div className="absolute top-4 left-4 flex items-center gap-2">
    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/90 text-white flex items-center gap-1.5 shadow-md">
    <Youtube className="w-3.5 h-3.5 fill-white" />
    <span>Trailer</span>
    </span>
   </div>
   </div>
  )}
  </div>

  {/* Footer controls & external link */}
  <div className="flex items-center justify-between gap-3 text-xs text-ink-500 px-1">
  <div className="flex items-center gap-2">
   {isPlaying ? (
   <button
    type="button"
    onClick={() => setIsPlaying(false)}
    className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer"
   >
    ← Close Player & View Thumbnail
   </button>
   ) : (
   <span className="text-ink-500">HD Streaming Quality via YouTube</span>
   )}
  </div>

  {watchUrl && (
   <a
   href={watchUrl}
   target="_blank"
   rel="noreferrer"
   className="inline-flex items-center gap-1.5 text-ink-300 hover:text-orange-400 font-medium transition-colors"
   >
   <span>Open in YouTube</span>
   <ExternalLink className="w-3.5 h-3.5" />
   </a>
  )}
  </div>
 </div>
 );
};
