import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const PwaOfflineBadge = ({ isOnline }) => {
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 max-w-lg w-full pointer-events-none animate-in slide-in-from-top-4 duration-300">
      {!isOnline ? (
        <div className="pointer-events-auto bg-[#2b0c13]/95 border border-[#f84464]/60 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#f84464] animate-pulse" />
            <span>Offline Mode Active • Serving cached movies & M-Tickets</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-[#f84464] px-2 py-0.5 rounded text-white">
            PWA
          </span>
        </div>
      ) : (
        <div className="pointer-events-auto bg-emerald-950/95 border border-emerald-500/60 backdrop-blur-xl text-emerald-100 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Connection Restored • Real-time cinema sync online</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-emerald-600 px-2 py-0.5 rounded text-white">
            Live
          </span>
        </div>
      )}
    </div>
  );
};
