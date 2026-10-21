import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles, WifiOff, Check } from 'lucide-react';

export const PwaInstallBanner = ({ isInstallable, installApp }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#141824]/95 backdrop-blur-2xl border border-[#f84464]/40 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-[#f84464]/20 flex flex-col gap-3 relative">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f84464] text-white flex items-center justify-center shadow-lg shadow-[#f84464]/40 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-white text-sm">Install BookMyShow</h4>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-[#f84464]/20 text-[#f84464] border border-[#f84464]/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Add to your home screen for instant booking, offline M-Tickets, and seamless cinema check-in.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 pt-1">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090b10] border border-white/10">
            <Check className="w-3 h-3 text-emerald-400" />
            Offline Tickets
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090b10] border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Instant Launch
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={installApp}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-lg shadow-[#f84464]/30 hover:scale-102 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install BookMyShow App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
