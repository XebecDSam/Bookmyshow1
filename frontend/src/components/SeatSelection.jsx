import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Check,
  Trash2,
  ChevronRight,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  toggleSeat,
  clearSeats,
  setTheatre,
  setShowDate,
  setShowTime,
  setOccupiedSeats,
} from '../store/bookingSlice';
import { movieApi } from '../services/api';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SeatSelection = ({ onBack, onProceedToCheckout }) => {
  const dispatch = useAppDispatch();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShowDate,
    selectedShowTime,
    selectedSeats,
    occupiedSeats,
    subtotal,
    convenienceFee,
    totalAmount,
  } = useAppSelector((state) => state.booking);

  const [theatresList, setTheatresList] = useState([]);
  const [loadingOccupied, setLoadingOccupied] = useState(false);

  // Load available theatres
  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        const data = await movieApi.getTheatres();
        setTheatresList(data || []);
        if (!selectedTheatre && data && data.length > 0) {
          dispatch(setTheatre(data[0]));
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      }
    };

    fetchTheatres();
  }, [dispatch, selectedTheatre]);

  // Fetch occupied seats for this exact movie, theatre, date, and showtime
  useEffect(() => {
    if (!selectedMovie || !selectedTheatre) return;

    const fetchOccupied = async () => {
      try {
        setLoadingOccupied(true);
        const occupied = await movieApi.getOccupiedSeats({
          movieId: selectedMovie.id,
          theatreId: selectedTheatre.id,
          showTime: selectedShowTime,
          showDate: selectedShowDate,
        });
        dispatch(setOccupiedSeats(occupied || []));
      } catch (err) {
        console.error('Failed to load occupied seats:', err);
      } finally {
        setLoadingOccupied(false);
      }
    };

    fetchOccupied();
  }, [selectedMovie, selectedTheatre, selectedShowDate, selectedShowTime, dispatch]);

  if (!selectedMovie) {
    return (
      <div className="p-16 text-center bg-[#121622] rounded-3xl border border-white/10 space-y-4 max-w-md mx-auto">
        <p className="text-slate-400">No movie selected.</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#f84464] text-white rounded-2xl text-xs font-bold cursor-pointer"
        >
          Select a Movie
        </button>
      </div>
    );
  }

  // Generate next 4 dates
  const availableDates = Array.from({ length: 4 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formatted };
  });

  const getSeatTier = (row) => {
    if (row === 'A' || row === 'B') {
      return {
        name: 'VIP Recliner',
        price: (selectedTheatre?.basePrice || 15) + 6,
        color: 'border-amber-500/50 text-amber-300',
        badge: 'VIP Recliner - ₹450 / $21',
      };
    }
    if (row === 'C' || row === 'D' || row === 'E') {
      return {
        name: 'Prime Gold',
        price: (selectedTheatre?.basePrice || 15) + 3,
        color: 'border-cyan-500/50 text-cyan-300',
        badge: 'Prime Gold - ₹300 / $18',
      };
    }
    return {
      name: 'Classic Club',
      price: (selectedTheatre?.basePrice || 15),
      color: 'border-slate-600 text-slate-300',
      badge: 'Classic Club - ₹200 / $15',
    };
  };

  const handleSeatClick = (seatId) => {
    if (occupiedSeats && occupiedSeats.includes(seatId)) return;
    dispatch(toggleSeat(seatId));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Selected Movie Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121622]/90 p-5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            title="Back to Movies"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f84464]/15 text-[#f84464] text-[10px] font-black uppercase tracking-wider mb-0.5">
              <span>BookMyShow Cinema Auditorium</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {selectedMovie.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
              <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-bold text-[10px]">
                {selectedMovie.certification || 'UA'}
              </span>
              <span>•</span>
              <span>{selectedMovie.runtime}</span>
              <span>•</span>
              <span>{selectedMovie.genres?.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Selected Movie Poster Thumbnail */}
        <div className="hidden sm:flex items-center gap-3 bg-[#0a0d14] px-4 py-2.5 rounded-2xl border border-white/10">
          <img
            src={selectedMovie.posterUrl}
            alt={selectedMovie.title}
            className="w-10 h-14 rounded-xl object-cover shadow-sm"
          />
          <div className="text-left text-xs">
            <p className="font-black text-white">⭐ {selectedMovie.rating?.toFixed(1)}/10</p>
            <p className="text-[11px] text-slate-400">IMAX 3D Laser</p>
          </div>
        </div>
      </div>

      {/* Date, Theatre & Showtime Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theatre Selection */}
        <div className="bg-[#121622] p-5 rounded-3xl border border-white/10 space-y-3 shadow-lg">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
            Select Cinema
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {theatresList.map((th) => {
              const isSelected = selectedTheatre?.id === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => dispatch(setTheatre(th))}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'bg-[#f84464]/15 border-[#f84464] text-white shadow-md shadow-[#f84464]/10'
                      : 'bg-[#090b10] border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-white">{th.name}</p>
                    {isSelected && <Check className="w-4 h-4 text-[#f84464]" />}
                  </div>
                  <p className="text-xs text-[#f84464] font-semibold mt-0.5">{th.screenType}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Base: ${th.basePrice.toFixed(2)} / ticket
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-[#121622] p-5 rounded-3xl border border-white/10 space-y-3 shadow-lg">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f84464]" />
            Select Date
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {availableDates.map(({ dateStr, dayName, formatted }) => {
              const isSelected = selectedShowDate === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => dispatch(setShowDate(dateStr))}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f84464] text-white border-[#f84464] shadow-lg shadow-[#f84464]/30 scale-102'
                      : 'bg-[#090b10] border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-black">{dayName}</p>
                  <p className="text-xs opacity-90 mt-0.5 font-medium">{formatted}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showtime Selection */}
        <div className="bg-[#121622] p-5 rounded-3xl border border-white/10 space-y-3 shadow-lg">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#f84464]" />
            Select Showtime
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(selectedTheatre?.showtimes || ['10:00 AM', '01:30 PM', '05:15 PM', '09:00 PM']).map(
              (time) => {
                const isSelected = selectedShowTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => dispatch(setShowTime(time))}
                    className={`py-3.5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f84464] text-white border-[#f84464] shadow-lg shadow-[#f84464]/30 scale-102'
                        : 'bg-[#090b10] border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black">{time}</span>
                  </button>
                );
              }
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#f84464]" />
            <span>Real-time seat availability updates automatically.</span>
          </p>
        </div>
      </div>

      {/* Interactive Cinema Seat Layout Map */}
      <div className="bg-[#10141f] p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Cinema Projector Curved Screen Visual */}
        <div className="max-w-2xl mx-auto mb-10 text-center relative">
          {/* Projector Glow Beam */}
          <div className="h-16 w-full screen-beam absolute -top-4 left-0 right-0 pointer-events-none opacity-40" />

          {/* Curved Screen Bar */}
          <div className="h-3 w-full bg-gradient-to-r from-[#f84464] via-white to-[#f84464] rounded-full screen-glow opacity-95 mx-auto" />
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mt-4 font-black flex items-center justify-center gap-2">
            <span>SCREEN THIS WAY</span>
            <span className="text-[10px] text-[#f84464] font-mono px-2 py-0.5 rounded bg-[#f84464]/10 border border-[#f84464]/20">
              AUDI 1 • 4K LASER
            </span>
          </p>
        </div>

        {/* Seat Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8 text-xs text-slate-300 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#1a202c] border border-white/20" />
            <span className="font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#f84464] border border-[#f84464] flex items-center justify-center text-white shadow-md shadow-[#f84464]/50">
              <Check className="w-3 h-3" />
            </div>
            <span className="font-extrabold text-white">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#08090d] border border-white/5 opacity-50 cursor-not-allowed" />
            <span className="text-slate-500 font-medium">Sold / Occupied</span>
          </div>
          <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-4 text-[11px]">
            <span className="text-amber-400 font-bold">VIP: +$6.00</span>
            <span className="text-cyan-400 font-bold">Prime: +$3.00</span>
            <span className="text-slate-400 font-bold">Classic: +$0.00</span>
          </div>
        </div>

        {/* Loading Indicator for occupied seats */}
        {loadingOccupied && (
          <div className="absolute inset-0 bg-[#090b10]/60 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2.5 bg-[#141824] px-5 py-3 rounded-2xl border border-white/10 text-xs text-white font-bold shadow-2xl">
              <Loader2 className="w-4 h-4 text-[#f84464] animate-spin" />
              <span>Fetching live seat reservations...</span>
            </div>
          </div>
        )}

        {/* Seat Grid Matrix */}
        <div className="flex flex-col items-center gap-3 overflow-x-auto py-2">
          {ROWS.map((row) => {
            const tier = getSeatTier(row);
            const isVIP = row === 'A' || row === 'B';
            const isPrime = row === 'C' || row === 'D' || row === 'E';

            return (
              <div key={row} className="flex items-center gap-2 sm:gap-3">
                {/* Row label */}
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  {row}
                </span>

                {/* Left group: seats 1-5 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {COLS.slice(0, 5).map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats && occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats && selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seatId)}
                        title={`${seatId} (${tier.name})`}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-150 flex items-center justify-center cursor-pointer seat-button ${
                          isOccupied
                            ? 'bg-[#08090e] border border-white/5 text-slate-600 cursor-not-allowed opacity-30'
                            : isSelected
                            ? 'bg-[#f84464] text-white shadow-xl shadow-[#f84464]/50 scale-105 border border-white'
                            : isVIP
                            ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:border-amber-300'
                            : isPrime
                            ? 'bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400'
                            : 'bg-[#181d2a] border border-white/10 text-slate-300 hover:bg-[#22293b] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : col}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle space */}
                <div className="w-5 sm:w-10 text-center text-[10px] text-slate-500 font-mono font-bold">
                  AISLE
                </div>

                {/* Right group: seats 6-10 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {COLS.slice(5, 10).map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats && occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats && selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seatId)}
                        title={`${seatId} (${tier.name})`}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-150 flex items-center justify-center cursor-pointer seat-button ${
                          isOccupied
                            ? 'bg-[#08090e] border border-white/5 text-slate-600 cursor-not-allowed opacity-30'
                            : isSelected
                            ? 'bg-[#f84464] text-white shadow-xl shadow-[#f84464]/50 scale-105 border border-white'
                            : isVIP
                            ? 'bg-amber-950/30 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:border-amber-300'
                            : isPrime
                            ? 'bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400'
                            : 'bg-[#181d2a] border border-white/10 text-slate-300 hover:bg-[#22293b] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : col}
                      </button>
                    );
                  })}
                </div>

                {/* Tier indicator pill on right */}
                <span
                  className={`hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-lg border ${tier.color}`}
                >
                  {tier.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Price Calculation & Sticky Checkout Dock (BookMyShow Style) */}
      <div className="sticky bottom-4 z-30 bg-[#0e121b]/95 p-5 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selected seats overview */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Selected Seats ({(selectedSeats && selectedSeats.length) || 0}/6 max)
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1 min-h-[30px]">
              {!selectedSeats || selectedSeats.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Tap any available seat above to select
                </span>
              ) : (
                selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#f84464]/20 border border-[#f84464]/40 text-[#ff617d] text-xs font-black shadow-sm"
                  >
                    {seat}
                  </span>
                ))
              )}
            </div>
          </div>

          {selectedSeats && selectedSeats.length > 0 && (
            <button
              onClick={() => dispatch(clearSeats())}
              className="p-2 text-slate-400 hover:text-[#f84464] hover:bg-white/5 rounded-xl transition cursor-pointer"
              title="Clear all selected seats"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">
              Tickets (${(subtotal || 0).toFixed(2)}) + Fee (${(convenienceFee || 0).toFixed(2)})
            </p>
            <p className="text-2xl font-black text-white">
              ${(totalAmount || 0).toFixed(2)}
            </p>
          </div>

          <button
            disabled={!selectedSeats || selectedSeats.length === 0}
            onClick={onProceedToCheckout}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 ${
              selectedSeats && selectedSeats.length > 0
                ? 'bg-[#f84464] hover:bg-[#e03251] text-white shadow-xl shadow-[#f84464]/40 hover:scale-105 cursor-pointer'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
