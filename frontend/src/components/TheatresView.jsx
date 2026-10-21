import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Film,
  Clock,
  Star,
  Ticket,
  Loader2,
  Sparkles,
  Coffee,
  Smartphone,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { movieApi } from '../services/api';
import { useAppDispatch } from '../store/store';
import { setTheatre, setBookingStep } from '../store/bookingSlice';

export const TheatresView = ({ onSelectTheatre }) => {
  const dispatch = useAppDispatch();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTheatres = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getTheatres();
        setTheatres(data || []);
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTheatres();
  }, []);

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#f84464] animate-spin" />
        <p className="text-sm font-semibold text-slate-400">
          Loading BookMyShow Partner Cinemas & Audi Screens...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f84464]/15 border border-[#f84464]/30 text-[#f84464] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM AUDITORIUMS & SCREENS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cinemas In Your City
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Book tickets at PVR, INOX, Cinepolis, and IMAX Laser 4K auditoriums.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Available</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" />
          <span>Filling Fast</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theatres.map((th) => (
          <div
            key={th.id}
            className="group bg-[#121622] rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-[#f84464]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#f84464]/10 bms-hover-lift"
          >
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#f84464]/15 text-[#f84464] border border-[#f84464]/30">
                  {th.screenType}
                </span>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  From ${th.basePrice?.toFixed(2)}
                </span>
              </div>

              {/* Cinema Title */}
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-[#f84464] transition-colors">
                  {th.name}
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-4 h-4 text-[#f84464] shrink-0 mt-0.5" />
                  <span>
                    {th.address}, {th.city}
                  </span>
                </div>
              </div>

              {/* Cinema Amenities (BookMyShow style) */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-medium text-slate-300 border-t border-white/5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5" /> M-Ticket
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Coffee className="w-3.5 h-3.5" /> F&B Service
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Volume2 className="w-3.5 h-3.5" /> Dolby 7.1
                </span>
              </div>

              {/* Showtimes Pill Strip */}
              <div className="pt-2">
                <p className="text-[10px] uppercase font-extrabold text-slate-400 mb-2 tracking-wider">
                  Select Showtime
                </p>
                <div className="flex flex-wrap gap-2">
                  {th.showtimes?.map((t, idx) => {
                    const isFilling = idx === 1 || idx === 2;
                    return (
                      <span
                        key={t}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                          isFilling
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-[#090b10] text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isFilling ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Select Theatre CTA */}
            <button
              onClick={() => {
                dispatch(setTheatre(th));
                if (onSelectTheatre) onSelectTheatre(th);
              }}
              className="mt-6 w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-[#f84464] text-white text-xs font-black transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-[#f84464] hover:shadow-lg hover:shadow-[#f84464]/30 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Select Cinema & Show</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
