import React from 'react';
import { Star, Clock, Info, Ticket, Play } from 'lucide-react';

export const MovieCard = ({
  movie,
  onSelectMovie,
  onViewDetails,
}) => {
  // Generate realistic BMS vote count from rating
  const voteCount = Math.floor(movie.rating * 14.8 + 22);

  return (
    <div className="group relative bg-[#131722] rounded-3xl border border-white/10 hover:border-[#f84464]/60 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#f84464]/20 transition-all duration-300 flex flex-col bms-hover-lift">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#090b10]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Ambient Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-[#0d1017]/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Certification Badge */}
          <span className="px-2 py-0.5 rounded-lg bg-[#0b0e14]/85 backdrop-blur-md border border-white/15 text-[10px] font-extrabold text-slate-200 uppercase tracking-wider">
            {movie.certification || 'UA'}
          </span>

          {/* BookMyShow Star Rating Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0e14]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}/10</span>
          </div>
        </div>

        {/* Middle Hover Play/Trailer Trigger */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#f84464] text-white flex items-center justify-center shadow-xl shadow-[#f84464]/50 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Banner Over Poster: Runtime & Vote Count (BookMyShow style) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 z-10">
          <div className="flex items-center gap-1.5 bg-[#0b0e14]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-[#f84464]" />
            <span>{movie.runtime}</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300/90 bg-[#0b0e14]/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5">
            {voteCount}K Votes
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-white line-clamp-1 group-hover:text-[#f84464] transition-colors tracking-tight">
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium">
            Dir. {movie.director}
          </p>

          {/* Formats & Languages Pill Strip */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
              2D, 3D, IMAX 3D
            </span>
            {movie.languages && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f84464]/10 text-[#ff617d] border border-[#f84464]/20">
                {movie.languages.slice(0, 2).join(', ')}
              </span>
            )}
          </div>

          {/* Genre Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1b202e] text-slate-300 border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons: Book Tickets & Details */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(movie)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onSelectMovie(movie)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-md shadow-[#f84464]/30 hover:shadow-[#f84464]/50 transition cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
