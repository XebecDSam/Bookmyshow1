import React, { useEffect, useState } from 'react';
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Lock,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { movieApi } from '../services/api';
import { useAppSelector } from '../store/store';
import { ModifyBookingModal } from './ModifyBookingModal';

export const BookingHistoryModal = ({
  isOpen,
  onClose,
  onViewTicket,
  onOpenAuth,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modifyingBooking, setModifyingBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const data = await movieApi.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to retrieve booking history from server. Ensure your token is valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchBookings();
    }
  }, [isOpen, isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${bookingId}? Full refund will be processed to original payment method.`
    );
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      await movieApi.cancelBooking(bookingId);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b
        )
      );
      setActionSuccess(`Booking #${bookingId} successfully cancelled.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert(err?.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleBookingUpdated = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    setActionSuccess(`Booking #${updatedBooking.id} details updated via PATCH!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f84464]/20 text-[#f84464] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Your Orders & Tickets</h3>
              <p className="text-xs text-slate-400">BookMyShow Purchase History & CRUD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchBookings}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Refresh bookings"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {actionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-200 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {!isAuthenticated && (
            <div className="p-10 text-center bg-[#090b10] rounded-2xl border border-white/10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  Sign In to View Orders
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Access your digital M-Tickets, manage showtimes, and view full booking receipts.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-6 py-3 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white font-black text-xs transition shadow-lg shadow-[#f84464]/30 cursor-pointer"
              >
                Sign In to BookMyShow
              </button>
            </div>
          )}

          {isAuthenticated && loading && (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#f84464] animate-spin" />
              <p className="text-xs text-slate-400">Loading your booked tickets...</p>
            </div>
          )}

          {isAuthenticated && !loading && error && (
            <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-xs text-red-200">{error}</p>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-[#f84464] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {isAuthenticated && !loading && !error && bookings.length === 0 && (
            <div className="p-12 text-center bg-[#090b10] rounded-2xl border border-white/10 space-y-3">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Bookings Found</h4>
              <p className="text-xs text-slate-400">
                You haven't made any ticket reservations yet. Explore blockbusters today!
              </p>
            </div>
          )}

          {isAuthenticated && !loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((b) => {
                const isCancelled = b.bookingStatus === 'CANCELLED';
                const isModified = b.bookingStatus === 'MODIFIED';

                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCancelled
                        ? 'bg-[#090b10]/40 border-white/5 opacity-55'
                        : 'bg-[#090b10] border-white/10 hover:border-white/20 shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Poster + Info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={b.moviePoster}
                          alt={b.movieTitle}
                          className="w-14 h-20 rounded-xl object-cover shrink-0 border border-white/10 shadow-sm"
                        />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-[#f84464]">
                              #{b.id}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isCancelled
                                  ? 'bg-red-950 text-red-400 border border-red-500/30'
                                  : isModified
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {b.bookingStatus}
                            </span>
                          </div>

                          <h4 className="font-black text-sm text-white mt-1">
                            {b.movieTitle}
                          </h4>

                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
                            <span>{b.theatreName}</span>
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{b.showDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="font-bold text-white">
                                {b.showTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Seats & Price */}
                      <div className="flex flex-col sm:items-end justify-between self-stretch sm:self-auto gap-3">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-slate-400 font-semibold">Seats:</span>
                          <div className="flex flex-wrap sm:justify-end gap-1 mt-0.5">
                            {b.seats?.map((seat) => (
                              <span
                                key={seat}
                                className="px-2 py-0.5 rounded-lg bg-[#f84464]/15 text-[#ff617d] border border-[#f84464]/30 text-[11px] font-mono font-bold"
                              >
                                {seat}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm font-black text-white font-mono mt-1">
                            ${b.totalAmount?.toFixed(2)}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewTicket(b)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition cursor-pointer text-xs font-bold flex items-center gap-1 border border-white/10"
                            title="View M-Ticket"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#f84464]" />
                            <span>M-Ticket</span>
                          </button>

                          {!isCancelled && (
                            <>
                              <button
                                onClick={() => setModifyingBooking(b)}
                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                                title="Modify Booking (PATCH)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Modify</span>
                              </button>

                              <button
                                disabled={cancellingId === b.id}
                                onClick={() => handleCancelBooking(b.id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition cursor-pointer text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                title="Cancel Booking (DELETE)"
                              >
                                {cancellingId === b.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modifyingBooking && (
        <ModifyBookingModal
          booking={modifyingBooking}
          onClose={() => setModifyingBooking(null)}
          onBookingUpdated={handleBookingUpdated}
        />
      )}
    </div>
  );
};
