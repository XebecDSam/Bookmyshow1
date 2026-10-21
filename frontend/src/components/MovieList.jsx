import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  Film,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { movieApi } from '../services/api';
import { MovieCard } from './MovieCard';

export const MovieList = ({ onSelectMovie, onViewDetails }) => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestMode, setRequestMode] = useState('axios'); // 'axios' | 'fetch'
  const [latencyMs, setLatencyMs] = useState(null);

  // Fetch movies data with Axios or native Fetch API
  const fetchMoviesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const startTime = performance.now();

      let data;
      if (requestMode === 'fetch') {
        data = await movieApi.getMoviesWithFetch(searchQuery, selectedGenre);
      } else {
        data = await movieApi.getMovies(searchQuery, selectedGenre);
      }

      const duration = (performance.now() - startTime).toFixed(1);
      setLatencyMs(duration);
      setMovies(data.movies || []);

      if (data.genres && data.genres.length > 0) {
        setGenres(data.genres);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to connect to BookMyShow backend server at http://localhost:5000. Please ensure the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMoviesData();
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedGenre, requestMode]);

  return (
    <section className="space-y-8">
      {/* Live REST API Engine Bar */}
      <div className="bg-[#111520] p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-white tracking-wide">
              BookMyShow Engine:
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            REST API • Dynamic State • Async Data Fetching
          </span>
          {latencyMs && (
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#090b10] text-emerald-400 font-mono font-bold border border-white/10">
              ⚡ {latencyMs}ms
            </span>
          )}
        </div>

        {/* Live Client Toggle: Axios vs Fetch API */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-semibold">Client:</span>
          <div className="flex p-0.5 bg-[#090b10] rounded-xl border border-white/10">
            <button
              onClick={() => setRequestMode('axios')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                requestMode === 'axios'
                  ? 'bg-[#f84464] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Axios
            </button>
            <button
              onClick={() => setRequestMode('fetch')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                requestMode === 'fetch'
                  ? 'bg-[#06b6d4] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fetch API
            </button>
          </div>
        </div>
      </div>

      {/* BookMyShow Search & Dynamic Filter Header Bar */}
      <div className="bg-[#121622]/90 p-4 sm:p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input Field */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Movies, Events, Plays, Sports and Activities..."
            className="w-full bg-[#0a0d14] border border-white/15 rounded-2xl pl-11 pr-16 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f84464] focus:ring-2 focus:ring-[#f84464]/30 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Genre Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f84464]" />
            <span>Genre:</span>
          </div>

          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#f84464] text-white shadow-lg shadow-[#f84464]/40 scale-105'
                    : 'bg-[#0a0d14] text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Movies Section Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Recommended Movies</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f84464]/20 text-[#f84464] border border-[#f84464]/30">
              Now Showing
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Book tickets in IMAX 3D, 4DX, ScreenX, ICE, and Dolby Atmos.
          </p>
        </div>

        {!isLoading && !error && (
          <span className="text-xs font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
            {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} Available
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-[#121622] rounded-3xl border border-white/10 p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[2/3] w-full bg-[#1e2434] rounded-2xl bms-shimmer" />
              <div className="h-5 bg-[#1e2434] rounded-lg w-3/4" />
              <div className="h-3 bg-[#1e2434]/70 rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-9 bg-[#1e2434] rounded-xl flex-1" />
                <div className="h-9 bg-[#1e2434] rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State Display */}
      {!isLoading && error && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#2a0e14] border border-red-500/30 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-[#f84464] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Movie API Request Failed
            </h3>
            <p className="text-xs text-red-200/90 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchMoviesData}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white font-bold text-xs shadow-lg shadow-[#f84464]/30 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="p-16 text-center rounded-3xl bg-[#121622]/60 border border-white/10 max-w-md mx-auto space-y-4">
          <Film className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-black text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400">
            No titles matched your search "{searchQuery}" in genre "{selectedGenre}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All');
            }}
            className="text-xs font-bold text-[#f84464] hover:text-[#ff617d] underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
};
