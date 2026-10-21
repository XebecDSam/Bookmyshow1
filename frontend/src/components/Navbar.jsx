import React, { useState } from 'react';
import {
  Film,
  Ticket,
  User as UserIcon,
  LogOut,
  Sliders,
  CheckCircle,
  MapPin,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logout } from '../store/authSlice';
import { setBookingStep } from '../store/bookingSlice';

const CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Kochi',
  'Chandigarh',
];

export const Navbar = ({
  onOpenAuth,
  onOpenBookings,
  onOpenInspector,
  activeTab,
  setActiveTab,
  isInstallable,
  onInstallApp,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedSeats, totalAmount, bookingStep } = useAppSelector(
    (state) => state.booking
  );

  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigateTo = (tab) => {
    dispatch(setBookingStep('movie-selection'));
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0f17]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & City Selector */}
        <div className="flex items-center gap-6">
          {/* Authentic BookMyShow Logo */}
          <div
            onClick={() => navigateTo('movies')}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="BookMyShow Home"
          >
            <div className="flex items-center">
              <div className="relative flex items-center bg-[#f84464] text-white font-extrabold px-3 py-1.5 rounded-l-xl shadow-md group-hover:brightness-110 transition">
                <span className="text-xl sm:text-2xl tracking-tighter font-black font-sans">
                  book
                </span>
                <span className="bg-white text-[#f84464] text-xs font-black px-1.5 py-0.5 rounded-md ml-1 shadow-sm">
                  my
                </span>
              </div>
              <div className="bg-[#181d2a] text-white font-black px-3 py-1.5 rounded-r-xl border border-white/10 group-hover:border-[#f84464]/50 transition">
                <span className="text-xl sm:text-2xl tracking-tighter text-white font-black">
                  show
                </span>
              </div>
            </div>
          </div>

          {/* City / Location Picker */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
              <span>{selectedCity}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 py-2 rounded-2xl bg-[#141824] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                  Select Popular City
                </p>
                <div className="max-h-56 overflow-y-auto pt-1">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-[#f84464]/20 text-[#f84464] font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#f84464]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Nav Tabs (Movies vs Theatres) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#141824]/90 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => navigateTo('movies')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'movies' && bookingStep === 'movie-selection'
                ? 'bg-[#f84464] text-white shadow-lg shadow-[#f84464]/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies</span>
          </button>
          <button
            onClick={() => navigateTo('theatres')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'theatres'
                ? 'bg-[#f84464] text-white shadow-lg shadow-[#f84464]/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Theatres & Screens</span>
          </button>
        </nav>

        {/* Right Action Group */}
        <div className="flex items-center gap-3">
          {/* PWA Install Button (When installable) */}
          {isInstallable && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f84464]/20 border border-[#f84464]/40 text-[#ff617d] hover:bg-[#f84464] hover:text-white transition text-xs font-bold shadow-md shadow-[#f84464]/10 cursor-pointer animate-bounce"
              title="Install BookMyShow Progressive Web App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* Active Redux Booking Cart Pill */}
          {selectedSeats && selectedSeats.length > 0 && bookingStep !== 'checkout' && (
            <button
              onClick={() => dispatch(setBookingStep('seat-selection'))}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#f84464]/15 border border-[#f84464]/40 text-[#ff617d] hover:bg-[#f84464]/25 transition text-xs font-bold shadow-md shadow-[#f84464]/20 animate-pulse cursor-pointer"
              title="Return to selected seats in checkout"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#f84464]" />
              <span>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}</span>
              <span className="bg-[#f84464] text-white text-[11px] px-1.5 py-0.5 rounded font-black">
                ${totalAmount.toFixed(2)}
              </span>
            </button>
          )}

          {/* Bookings History Button */}
          <button
            onClick={onOpenBookings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-[#f84464]/40 hover:bg-white/10 transition text-xs font-bold cursor-pointer"
            title="View Booking History (CRUD Bookings)"
          >
            <Ticket className="w-4 h-4 text-[#f84464]" />
            <span className="hidden sm:inline">Your Orders</span>
          </button>

          {/* Experiment Inspector Drawer Button */}
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 hover:text-white text-xs font-bold shadow-sm transition cursor-pointer"
            title="Inspect Experiments 1 to 4 & Redux State"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">API Lab</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* Authentication Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      user.name
                    )}`
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-xl border border-[#f84464]/50 object-cover shadow-sm"
                />
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white leading-tight">
                      {user.name}
                    </p>
                    <CheckCircle className="w-3 h-3 text-[#f84464]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-[#f84464] hover:border-[#f84464]/40 transition cursor-pointer"
                title="Log out from BookMyShow"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f84464] hover:bg-[#e03251] text-white font-bold text-xs shadow-lg shadow-[#f84464]/30 hover:shadow-[#f84464]/50 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* BookMyShow Secondary Categories Bar */}
      <div className="bg-[#080a0f] border-t border-white/5 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 font-semibold text-slate-400 whitespace-nowrap">
            <button
              onClick={() => navigateTo('movies')}
              className={`hover:text-white transition cursor-pointer ${activeTab === 'movies' ? 'text-[#f84464] font-bold' : ''}`}
            >
              Movies
            </button>
            <span className="flex items-center gap-1.5 hover:text-white transition cursor-pointer">
              <span>Stream</span>
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-[#f84464] text-white">
                New
              </span>
            </span>
            <span className="hover:text-white transition cursor-pointer">Events</span>
            <span className="hover:text-white transition cursor-pointer">Plays</span>
            <span className="hover:text-white transition cursor-pointer">Sports</span>
            <span className="hover:text-white transition cursor-pointer">Activities</span>
            <button
              onClick={() => navigateTo('theatres')}
              className={`hover:text-white transition cursor-pointer ${activeTab === 'theatres' ? 'text-[#f84464] font-bold' : ''}`}
            >
              Cinemas
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="hover:text-slate-200 transition cursor-pointer">ListYourShow</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition cursor-pointer">Corporates</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition cursor-pointer">Offers</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition cursor-pointer">Gift Cards</span>
          </div>
        </div>
      </div>
    </header>
  );
};
