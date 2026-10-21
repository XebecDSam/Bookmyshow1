import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Share2,
  Ticket,
  Sparkles,
} from 'lucide-react';

export const BookingTicketModal = ({
  booking,
  onClose,
  onBookAnother,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* BookMyShow M-Ticket Header */}
        <div className="p-4 bg-[#f84464] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <span className="text-xs font-black tracking-wider uppercase">
                BookMyShow M-Ticket
              </span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-black/20 font-bold">
                CONFIRMED
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cinematic Ticket Body */}
        <div className="p-6">
          <div className="bg-[#090b10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top Movie Banner */}
            <div className="relative p-5 pb-6 bg-[#0d1017] border-b border-dashed border-white/15 flex gap-4">
              <img
                src={booking.moviePoster}
                alt={booking.movieTitle}
                className="w-20 h-28 rounded-xl object-cover shrink-0 shadow-lg border border-white/10"
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f84464] bg-[#f84464]/10 px-2 py-0.5 rounded border border-[#f84464]/20">
                  Admit {booking.ticketCount} • IMAX 3D Laser
                </span>
                <h3 className="text-xl font-black text-white truncate mt-1.5">
                  {booking.movieTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#f84464] shrink-0" />
                  <span className="truncate">{booking.theatreName}</span>
                </p>

                <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#f84464]" />
                    <span className="font-semibold">{booking.showDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#f84464]" />
                    <span className="font-extrabold text-white">
                      {booking.showTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated Side Cutouts & Tear Line */}
            <div className="relative flex items-center justify-between h-4 bg-[#090b10]">
              <div className="w-4 h-8 bg-[#111520] rounded-r-full -ml-2 border-r border-white/10" />
              <div className="flex-1 border-b border-dashed border-white/20 mx-2" />
              <div className="w-4 h-8 bg-[#111520] rounded-l-full -mr-2 border-l border-white/10" />
            </div>

            {/* Middle Ticket Details */}
            <div className="p-5 grid grid-cols-2 gap-4 text-xs border-b border-white/10">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">
                  Confirmed Seats
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.seats?.map((seat) => (
                    <span
                      key={seat}
                      className="px-2.5 py-0.5 rounded-lg bg-[#f84464]/15 text-[#ff617d] border border-[#f84464]/30 font-mono font-black"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">
                  Booking Reference
                </p>
                <p className="text-xs font-mono font-black text-white mt-1">
                  BMS-{booking.bookingReference || booking.id}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">
                  Screen & Audi
                </p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  AUDI 02 • PRIME SCREEN
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">
                  Total Paid
                </p>
                <p className="text-base font-black text-[#f84464] mt-0.5">
                  ${booking.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* QR Code & Scanner Validation Bar */}
            <div className="p-5 bg-[#06080d] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-black text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#f84464]" />
                  <span>Contactless M-Ticket</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Scan this code at cinema gate for paperless direct entry.
                </p>
              </div>

              {/* Realistic SVG QR Placeholder */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-[9px] font-mono font-bold text-center leading-tight">
                  SCAN BMS
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Pass</span>
            </button>

            <button
              onClick={onBookAnother}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-lg shadow-[#f84464]/30 hover:scale-102 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Book More Movies</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
