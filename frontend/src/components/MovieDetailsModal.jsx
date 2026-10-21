import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  Clock,
  Calendar,
  Ticket,
  MapPin,
  Loader2,
  AlertCircle,
  ExternalLink,
  Play,
  Share2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { movieApi } from '../services/api';

export const MovieDetailsModal = ({
  movieId,
  onClose,
  onBookMovie,
}) => {
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!movieId) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieApi.getMovieDetails(movieId);
        setMovie(data.movie);
        setTheatres(data.theatres || []);
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError(
          err?.response?.data?.message || 'Failed to load movie details from server.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [movieId]);

  if (!movieId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#090b10]/80 hover:bg-[#090b10] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#f84464] animate-spin" />
            <p className="text-sm font-semibold text-slate-400">
              Loading BookMyShow Movie Details...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-[#f84464] mx-auto" />
            <h3 className="text-lg font-bold text-white">Error Loading Details</h3>
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Movie Details Content */}
        {!loading && !error && movie && (
          <div>
            {/* Backdrop Banner with BookMyShow Cinematic Look */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-[#090b10]">
              <img
                src={movie.backdropUrl || movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover object-center scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/60 to-transparent" />

              {/* Banner Details */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#f84464] text-white">
                      BookMyShow Premiere
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-md">
                      {movie.certification || 'UA'}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#f84464]" />
                      {movie.runtime}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {movie.title}
                  </h1>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{movie.rating.toFixed(1)}/10</span>
                      <span className="text-slate-400 font-normal ml-1">
                        ({Math.floor(movie.rating * 15.2 + 20)}K Votes)
                      </span>
                    </div>

                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isLiked
                          ? 'bg-[#f84464]/20 border-[#f84464] text-[#f84464]'
                          : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#f84464]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Direct Action: Book Tickets */}
                <div className="flex items-center gap-3">
                  {movie.trailerUrl && (
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition backdrop-blur-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Trailer</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      onBookMovie(movie);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-xl shadow-[#f84464]/40 hover:scale-105 transition cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Book Tickets</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* About the Movie */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">
                  About the Movie
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {movie.synopsis}
                </p>
              </div>

              {/* Formats, Genres & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0a0d14] border border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Genres</p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {movie.genres?.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Languages</p>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {movie.languages?.join(', ') || 'English, Hindi, Tamil'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Director</p>
                  <p className="text-xs font-bold text-white mt-0.5">{movie.director}</p>
                </div>
              </div>

              {/* Cast Members */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">
                    Cast
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {movie.cast.map((actor) => (
                      <div
                        key={actor}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#f84464]/20 text-[#f84464] flex items-center justify-center font-bold text-[10px]">
                          {actor.charAt(0)}
                        </div>
                        <span className="font-semibold">{actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
