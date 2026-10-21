import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/store';
import { setMovie, setBookingStep, resetBooking } from './store/bookingSlice';
import { logout } from './store/authSlice';
import { Navbar } from './components/Navbar';
import { MovieList } from './components/MovieList';
import { TheatresView } from './components/TheatresView';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { SeatSelection } from './components/SeatSelection';
import { CheckoutModal } from './components/CheckoutModal';
import { BookingTicketModal } from './components/BookingTicketModal';
import { BookingHistoryModal } from './components/BookingHistoryModal';
import { AuthModal } from './components/AuthModal';
import { ExperimentInspector } from './components/ExperimentInspector';
import { ToastContainer } from './components/Toast';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { PwaOfflineBadge } from './components/PwaOfflineBadge';
import { usePWA } from './pwa/usePWA';
import {
  Film,
  Sparkles,
  Ticket,
  Shield,
  Layers,
  ArrowRight,
  Play,
  Star,
  Clock,
  Compass,
  Heart,
  ChevronRight,
  Tv,
  Smartphone,
  Download,
} from 'lucide-react';

export function App() {
  const dispatch = useAppDispatch();
  const { bookingStep, selectedMovie, lastConfirmedBooking } = useAppSelector(
    (state) => state.booking
  );

  const { isInstallable, isStandalone, isOnline, hasUpdate, installApp } = usePWA();

  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'theatres'
  const [detailMovieId, setDetailMovieId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handle URL query parameters for PWA shortcuts (e.g. /?tab=theatres, /?tab=orders)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'theatres') {
        setActiveTab('theatres');
      } else if (tabParam === 'orders') {
        setIsBookingsOpen(true);
      }
    }
  }, []);

  // Show toast when PWA update is available
  useEffect(() => {
    if (hasUpdate) {
      addToast(
        'info',
        'BookMyShow Update Ready',
        'A new version of BookMyShow has been cached. Reload to activate new features.'
      );
    }
  }, [hasUpdate]);

  // Listen to 401 expired event from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = (e) => {
      dispatch(logout());
      addToast(
        'error',
        'BookMyShow Session Expired',
        e.detail?.message || 'Your authentication token is invalid or has expired.'
      );
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [dispatch]);

  // Handle movie selection for booking
  const handleSelectMovie = (movie) => {
    dispatch(setMovie(movie));
    dispatch(setBookingStep('seat-selection'));
    addToast(
      'info',
      'Movie Selected',
      `"${movie.title}" selected. Choose your cinema seats in BookMyShow.`
    );
  };

  // Handle booking success
  const handleBookingSuccess = () => {
    dispatch(setBookingStep('confirmation'));
    setIsTicketOpen(true);
    addToast(
      'success',
      'BookMyShow Tickets Confirmed!',
      'Your M-Ticket has been generated and saved for offline viewing.'
    );
  };

  const handleViewTicketFromHistory = (booking) => {
    setActiveTicket(booking);
    setIsTicketOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-[#f84464] selection:text-white">
      {/* Offline Status Badge */}
      <PwaOfflineBadge isOnline={isOnline} />

      {/* Top BookMyShow Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isInstallable={isInstallable}
        onInstallApp={installApp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Step 1: Movie Selection Screen */}
        {bookingStep === 'movie-selection' && (
          <>
            {/* Extraordinary BookMyShow Hero Cinematic Showcase Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1f0e14] via-[#101420] to-[#0c0f17] border border-white/10 p-8 sm:p-12 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f84464]/20 border border-[#f84464]/40 text-[#ff617d] text-xs font-black tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#f84464]" />
                  <span>BOOKMYSHOW EXCLUSIVE PREMIERES & PWA</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Experience Blockbusters in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f84464] via-[#ff617d] to-amber-300">IMAX Laser 3D</span> & 4DX
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                  Instant live seat reservation across top cinema chains. Offline-ready Progressive Web App with digital M-Tickets, Redux state management, and contactless QR entry.
                </p>

                {/* BookMyShow Highlights & PWA Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090b10]/80 border border-white/10">
                    <Smartphone className="w-3.5 h-3.5 text-[#f84464]" />
                    PWA Offline Mode
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090b10]/80 border border-white/10">
                    <Film className="w-3.5 h-3.5 text-[#f84464]" />
                    REST Catalog
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090b10]/80 border border-white/10">
                    <Layers className="w-3.5 h-3.5 text-[#06b6d4]" />
                    Redux Toolkit & Middleware
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090b10]/80 border border-white/10">
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    Instant M-Ticket CRUD
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090b10]/80 border border-white/10">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Secure JWT Auth
                  </span>
                </div>
              </div>

              {/* Ambient Glow & Cinema Light Vignette */}
              <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-gradient-to-l from-[#f84464]/15 via-purple-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Content View Switcher: Movies vs Theatres */}
            {activeTab === 'movies' ? (
              <MovieList
                onSelectMovie={handleSelectMovie}
                onViewDetails={(m) => setDetailMovieId(m.id)}
              />
            ) : (
              <TheatresView
                onSelectTheatre={(th) => {
                  setActiveTab('movies');
                  addToast(
                    'info',
                    'Theatre Selected',
                    `Selected ${th.name}. Now choose a movie to book.`
                  );
                }}
              />
            )}
          </>
        )}

        {/* Step 2: Seat Selection Screen */}
        {bookingStep === 'seat-selection' && (
          <SeatSelection
            onBack={() => dispatch(setBookingStep('movie-selection'))}
            onProceedToCheckout={() => dispatch(setBookingStep('checkout'))}
          />
        )}
      </main>

      {/* BookMyShow Corporate Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#07090d] pt-12 pb-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Banner: List Your Show */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-[#121622] border border-white/10 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f84464]/20 text-[#f84464] flex items-center justify-center font-bold">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">List your Show on BookMyShow</h4>
                <p className="text-xs text-slate-400">
                  Got a show, event, activity or a cinema? Partner with BookMyShow to reach millions.
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white font-bold text-xs shadow-md shadow-[#f84464]/30 cursor-pointer whitespace-nowrap">
              Contact Today
            </button>
          </div>

          {/* Quick Links Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left border-b border-white/5 pb-8">
            <div>
              <p className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">
                Movies Now Showing
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="hover:text-white cursor-pointer">Dune: Part Two (IMAX 3D)</li>
                <li className="hover:text-white cursor-pointer">Oppenheimer (70mm)</li>
                <li className="hover:text-white cursor-pointer">Spider-Man: Across Spider-Verse</li>
                <li className="hover:text-white cursor-pointer">The Batman (Dolby Cinema)</li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">
                Popular Cinemas
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="hover:text-white cursor-pointer">PVR Superplex IMAX</li>
                <li className="hover:text-white cursor-pointer">Cinepolis Luxe Atmos</li>
                <li className="hover:text-white cursor-pointer">INOX Megaplex 4DX</li>
                <li className="hover:text-white cursor-pointer">Miraj City Gold</li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">
                Help & Support
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="hover:text-white cursor-pointer">24/7 Customer Care</li>
                <li className="hover:text-white cursor-pointer">Resend Booking Confirmation</li>
                <li className="hover:text-white cursor-pointer">Refund & Cancellation Policy</li>
                <li className="hover:text-white cursor-pointer">Security & Privacy Terms</li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">
                PWA Web App
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Install as a lightweight Progressive Web App on Windows, macOS, Android, or iOS.
              </p>
              {isInstallable ? (
                <button
                  onClick={installApp}
                  className="px-3.5 py-2 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-md shadow-[#f84464]/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white">
                    App Ready
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white">
                    Offline Enabled
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="space-y-2 text-center">
            <p className="font-black text-slate-300 text-sm tracking-tight">
              book<span className="text-[#f84464]">my</span>show
            </p>
            <p className="text-[11px] text-slate-400">
              © 2026 Bigtree Entertainment Pvt. Ltd. All Rights Reserved. (BookMyShow Progressive Web App)
            </p>
          </div>
        </div>
      </footer>

      {/* Floating PWA Install Banner */}
      <PwaInstallBanner isInstallable={isInstallable} installApp={installApp} />

      {/* Dynamic Movie Details Modal */}
      <MovieDetailsModal
        movieId={detailMovieId}
        onClose={() => setDetailMovieId(null)}
        onBookMovie={handleSelectMovie}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={bookingStep === 'checkout'}
        onClose={() => dispatch(setBookingStep('seat-selection'))}
        onOpenAuth={() => setIsAuthOpen(true)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Digital M-Ticket Modal */}
      <BookingTicketModal
        booking={activeTicket || lastConfirmedBooking}
        onClose={() => {
          setIsTicketOpen(false);
          setActiveTicket(null);
        }}
        onBookAnother={() => {
          setIsTicketOpen(false);
          setActiveTicket(null);
          dispatch(resetBooking());
        }}
      />

      {/* Booking History & Orders Modal */}
      <BookingHistoryModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        onViewTicket={handleViewTicketFromHistory}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          addToast('success', 'Signed In', 'Welcome to BookMyShow! JWT token attached.');
        }}
      />

      {/* Experiment Lab Inspector Drawer */}
      <ExperimentInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
