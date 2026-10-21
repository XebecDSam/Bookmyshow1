import React, { useState } from 'react';
import {
  X,
  Edit3,
  Calendar,
  Clock,
  Check,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { movieApi } from '../services/api';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export const ModifyBookingModal = ({
  booking,
  onClose,
  onBookingUpdated,
}) => {
  if (!booking) return null;

  const [selectedSeats, setSelectedSeats] = useState(booking.seats || []);
  const [selectedTime, setSelectedTime] = useState(booking.showTime || '05:15 PM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showtimes = ['10:00 AM', '01:30 PM', '05:15 PM', '09:00 PM'];

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      if (selectedSeats.length === 1) {
        setError('At least 1 seat must remain selected.');
        return;
      }
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      setError(null);
    } else {
      if (selectedSeats.length >= 6) {
        setError('Maximum 6 seats allowed per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
      setError(null);
    }
  };

  const handleSaveModification = async () => {
    try {
      setLoading(true);
      setError(null);

      const updated = await movieApi.modifyBooking(booking.id, {
        seats: selectedSeats,
        showTime: selectedTime,
      });

      onBookingUpdated(updated);
      onClose();
    } catch (err) {
      console.error('Failed to update booking:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to update booking details. Please try different seats.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Modify Booking #{booking.id}
              </h3>
              <p className="text-xs text-slate-400">
                Update showtime or re-select seats (PATCH)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Showtime Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#f84464]" />
              Change Showtime
            </label>
            <div className="grid grid-cols-2 gap-2">
              {showtimes.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#f84464] text-white border-[#f84464]'
                        : 'bg-[#090b10] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Grid Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-400">
                Select New Seats ({selectedSeats.length}/6)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedSeats.join(', ')}
              </span>
            </div>

            <div className="p-4 bg-[#090b10] rounded-2xl border border-white/10 flex flex-col items-center gap-1.5 overflow-x-auto">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center gap-1.5">
                  <span className="w-4 text-center text-[10px] font-bold text-slate-500">
                    {row}
                  </span>
                  <div className="flex gap-1">
                    {COLS.map((col) => {
                      const seatId = `${row}${col}`;
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={() => toggleSeat(seatId)}
                          className={`w-7 h-7 rounded-lg text-[10px] font-bold transition flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#f84464] text-white font-black shadow-md shadow-[#f84464]/30'
                              : 'bg-[#181d2a] text-slate-300 border border-white/10 hover:border-white/30'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-[#f84464] shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#090b10] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSaveModification}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-lg shadow-[#f84464]/30 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
