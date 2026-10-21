import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Ticket,
  Calendar,
  Clock,
  Lock,
  Loader2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setConfirmedBooking } from '../store/bookingSlice';
import { movieApi } from '../services/api';

export const CheckoutModal = ({
  isOpen,
  onClose,
  onOpenAuth,
  onBookingSuccess,
}) => {
  const dispatch = useAppDispatch();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShowDate,
    selectedShowTime,
    selectedSeats,
    subtotal,
    convenienceFee,
    totalAmount,
  } = useAppSelector((state) => state.booking);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen || !selectedMovie || !selectedTheatre) return null;

  const handleConfirmPayment = async () => {
    if (!isAuthenticated || !user) {
      onOpenAuth();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const bookingPayload = {
        movieId: selectedMovie.id,
        theatreId: selectedTheatre.id,
        showDate: selectedShowDate,
        showTime: selectedShowTime,
        seats: selectedSeats,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card (**** 4242)'
            : paymentMethod === 'upi'
            ? 'UPI / QR Payment'
            : paymentMethod === 'wallet'
            ? 'BookMyShow Quick Pay'
            : 'Google Pay',
      };

      const newBooking = await movieApi.createBooking(bookingPayload);
      dispatch(setConfirmedBooking(newBooking));
      onBookingSuccess();
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMessage(
        err?.response?.data?.message ||
          'Failed to complete booking transaction. Please verify seat availability and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f84464]/20 text-[#f84464] flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Order Summary</h3>
              <p className="text-xs text-slate-400">BookMyShow Secure Checkout</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Movie & Theatre Card */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#090b10] border border-white/10">
            <img
              src={selectedMovie.posterUrl}
              alt={selectedMovie.title}
              className="w-16 h-24 rounded-xl object-cover shrink-0 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-white text-base truncate">
                {selectedMovie.title}
              </h4>
              <p className="text-xs text-[#f84464] font-semibold mt-0.5">
                {selectedTheatre.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {selectedShowDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedShowTime}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Seats: <span className="text-white font-bold">{selectedSeats.join(', ')}</span> ({selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'})
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#090b10] border border-white/10 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Ticket Base Price ({selectedSeats.length} seats)</span>
              <span className="text-white font-semibold">${(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Convenience Fee & GST (10%)</span>
              <span className="text-white font-semibold">${(convenienceFee || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2.5 flex justify-between items-center text-sm">
              <span className="font-extrabold text-white">Total Amount Payable</span>
              <span className="text-xl font-black text-[#f84464]">
                ${(totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Select Payment Option
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-[#f84464]/15 border-[#f84464] text-white shadow-sm'
                    : 'bg-[#090b10] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#f84464]" />
                <span className="text-xs font-bold">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-[#f84464]/15 border-[#f84464] text-white shadow-sm'
                    : 'bg-[#090b10] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-xs font-bold">UPI / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'bg-[#f84464]/15 border-[#f84464] text-white shadow-sm'
                    : 'bg-[#090b10] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Wallet className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">BMS Wallet</span>
              </button>
            </div>
          </div>

          {/* Authentication Banner Prompt */}
          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Account sign in required to confirm booking</span>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer shadow-sm"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-[#f84464] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted • Guaranteed Seat Allocation</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#090b10] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Change Seats
          </button>

          <button
            disabled={isSubmitting}
            onClick={handleConfirmPayment}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-xl shadow-[#f84464]/30 hover:scale-102 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ${(totalAmount || 0).toFixed(2)} & Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
