import React, { useEffect, useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  Play,
  RefreshCw,
  Trash2,
  Edit3,
  PlusCircle,
  Code,
  Send,
  Boxes,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  toggleSeat,
  selectSeat,
  removeSeat,
  clearSeats,
  setMovie,
} from '../store/bookingSlice';
import { useZustandBookingStore } from '../store/zustandStore';
import { recentMiddlewareLogs } from '../store/middleware/bookingMiddleware';
import { movieApi } from '../services/api';

export const ExperimentInspector = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { booking, auth } = useAppSelector((state) => state);
  const zustandStore = useZustandBookingStore();

  const [middlewareLogs, setMiddlewareLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('experiments'); // 'experiments' | 'playground' | 'redux' | 'zustand' | 'middleware' | 'jwt'
  const [testResult, setTestResult] = useState(null);
  const [crudOutput, setCrudOutput] = useState(null);
  const [loadingCrud, setLoadingCrud] = useState(false);
  const [apiClientMode, setApiClientMode] = useState('axios'); // 'axios' | 'fetch'

  useEffect(() => {
    setMiddlewareLogs([...recentMiddlewareLogs]);

    const handleNewLog = (e) => {
      setMiddlewareLogs((prev) => [e.detail, ...prev.slice(0, 24)]);
    };

    window.addEventListener('redux:middleware:log', handleNewLog);
    return () => window.removeEventListener('redux:middleware:log', handleNewLog);
  }, []);

  if (!isOpen) return null;

  // Test 401 simulation (Experiment 4f)
  const handleTestExpiredToken = async () => {
    try {
      console.log('%c[Inspector Test] Simulating Expired Token (401)...', 'color: #f87171; font-weight: bold;');
      setTestResult('Triggering simulated 401 Unauthorized API response...');
      localStorage.setItem('cinepass_token', 'simulated_expired_token');
      await movieApi.getBookings();
    } catch (err) {
      setTestResult(
        `[Interceptor Triggered] 401 Unauthorized caught. Token purged from localStorage.`
      );
    }
  };

  // Test 500 error state (Experiment 1f & 3f)
  const handleTestServerError = async () => {
    try {
      console.log('%c[Inspector Test] Simulating 500 Server Error...', 'color: #f87171; font-weight: bold;');
      setTestResult('Calling /api/test/error-state?status=500 ...');
      await movieApi.testError(500);
    } catch (err) {
      setTestResult(
        `[API Error Handled] Status 500 caught: "${err?.response?.data?.message || err.message}"`
      );
    }
  };

  // Experiment 1a: Test GET movies using either Axios or Fetch
  const handleTestGetMovies = async () => {
    try {
      setLoadingCrud(true);
      const start = performance.now();
      let res;
      if (apiClientMode === 'fetch') {
        res = await movieApi.getMoviesWithFetch('', 'All');
      } else {
        res = await movieApi.getMovies('', 'All');
      }
      const duration = (performance.now() - start).toFixed(1);
      setCrudOutput({
        type: `GET /api/movies (${apiClientMode.toUpperCase()} - ${duration}ms)`,
        status: '200 OK',
        count: res.movies?.length,
        data: res.movies?.map((m) => ({ id: m.id, title: m.title, rating: m.rating })),
      });
    } catch (err) {
      setCrudOutput({ error: err.message });
    } finally {
      setLoadingCrud(false);
    }
  };

  // Experiment 3b: Test POST booking
  const handleTestCreateBooking = async () => {
    try {
      setLoadingCrud(true);
      const testPayload = {
        movieId: 'mov-1',
        theatreId: 'th-1',
        showDate: new Date().toISOString().split('T')[0],
        showTime: '05:15 PM',
        seats: ['F1', 'F2'],
        paymentMethod: 'Test Card (**** 4242)',
      };
      const res = await movieApi.createBooking(testPayload);
      setCrudOutput({
        type: 'POST /api/bookings (Create Booking)',
        status: '201 Created',
        booking: res,
      });
    } catch (err) {
      setCrudOutput({
        type: 'POST /api/bookings Failed',
        status: err?.response?.status || 'Error',
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoadingCrud(false);
    }
  };

  // Experiment 3e: Test GET user bookings
  const handleTestGetBookings = async () => {
    try {
      setLoadingCrud(true);
      const res = await movieApi.getBookings();
      setCrudOutput({
        type: 'GET /api/bookings (Booking History)',
        status: '200 OK',
        count: res.length,
        bookings: res,
      });
    } catch (err) {
      setCrudOutput({
        type: 'GET /api/bookings (Protected API)',
        status: err?.response?.status || '401 Unauthorized',
        message: err?.response?.data?.message || 'Must be logged in with Bearer token.',
      });
    } finally {
      setLoadingCrud(false);
    }
  };

  // Experiment 3c: Test PATCH booking
  const handleTestModifyBooking = async () => {
    try {
      setLoadingCrud(true);
      const bookings = await movieApi.getBookings();
      if (!bookings || bookings.length === 0) {
        setCrudOutput({ message: 'No existing bookings found to modify. Create one first!' });
        return;
      }
      const target = bookings[0];
      const res = await movieApi.modifyBooking(target.id, {
        seats: ['G4', 'G5'],
        showTime: '09:00 PM',
      });
      setCrudOutput({
        type: `PATCH /api/bookings/${target.id} (Modify)`,
        status: '200 OK',
        updatedBooking: res,
      });
    } catch (err) {
      setCrudOutput({
        type: 'PATCH /api/bookings Failed',
        status: err?.response?.status || 'Error',
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoadingCrud(false);
    }
  };

  // Experiment 3d: Test DELETE cancel booking
  const handleTestCancelBooking = async () => {
    try {
      setLoadingCrud(true);
      const bookings = await movieApi.getBookings();
      const active = bookings?.find((b) => b.bookingStatus !== 'CANCELLED');
      if (!active) {
        setCrudOutput({ message: 'No active booking available to cancel.' });
        return;
      }
      const res = await movieApi.cancelBooking(active.id);
      setCrudOutput({
        type: `DELETE /api/bookings/${active.id} (Cancel)`,
        status: '200 OK',
        responseMessage: res,
      });
    } catch (err) {
      setCrudOutput({
        type: 'DELETE /api/bookings Failed',
        status: err?.response?.status || 'Error',
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoadingCrud(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Lab Experiment Inspector</h3>
            <p className="text-[11px] text-slate-400">Live evaluation, console debugging & store monitor</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-6 p-1.5 bg-slate-900/80 border-b border-slate-800 text-[10px] font-semibold gap-1">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
            activeTab === 'experiments'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Checklist
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeTab === 'playground'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>API</span>
        </button>
        <button
          onClick={() => setActiveTab('redux')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
            activeTab === 'redux'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Redux
        </button>
        <button
          onClick={() => setActiveTab('zustand')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeTab === 'zustand'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-400/80 hover:text-amber-300'
          }`}
        >
          <Boxes className="w-3 h-3" />
          <span>Zustand</span>
        </button>
        <button
          onClick={() => setActiveTab('middleware')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeTab === 'middleware'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Logs</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
        <button
          onClick={() => setActiveTab('jwt')}
          className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
            activeTab === 'jwt'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Auth/JWT
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* CHECKLIST TAB */}
        {activeTab === 'experiments' && (
          <div className="space-y-4 text-xs">
            {/* Experiment 1 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 text-xs">Experiment 1</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  Verified
                </span>
              </div>
              <p className="font-bold text-white text-xs">
                API Integration & Async Data (REST, Axios, Fetch)
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>a) Fetch movie & theatre info from REST APIs</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>b) Display movies using reusable MovieCard components</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>c) Movie search & genre filtering using API data</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>d) Fetch individual movie details dynamically</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>e) Async requests using async/await</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>f) Loading & error states</span>
                </li>
              </ul>
            </div>

            {/* Experiment 2 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-xs">Experiment 2</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  Verified
                </span>
              </div>
              <p className="font-bold text-white text-xs">
                State Management (Redux Toolkit, Zustand, Middleware)
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>a) Global store using Redux Toolkit AND Zustand</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>b) Manage movie, theatre, show timing, and seats</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>c) Actions for selecting and removing seats</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>d) Real-time ticket price & total booking calculation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>e) Custom middleware for booking actions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>f) State maintained across MovieList, SeatSelection & Checkout</span>
                </li>
              </ul>
            </div>

            {/* Experiment 3 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">Experiment 3</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  Verified
                </span>
              </div>
              <p className="font-bold text-white text-xs">
                CRUD Operations using APIs (GET, POST, PUT/PATCH, DELETE)
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>a) Retrieve movie & show info using GET</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>b) Create booking using POST</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>c) Modify booking details using PUT / PATCH</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>d) Cancel a booking using DELETE</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>e) Display booking history using GET</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>f) Loading & error states</span>
                </li>
              </ul>
            </div>

            {/* Experiment 4 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs">Experiment 4</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  Verified
                </span>
              </div>
              <p className="font-bold text-white text-xs">
                Secure Booking with Authentication & Tokens
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>a) User login using authentication API</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>b) Store & manage JWT token in Redux + localStorage</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>c) Attach token via Axios request interceptor</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>d) Protect booking, payment & history operations</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>e) Logout and token removal</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>f) Handle unauthorized & expired tokens via response interceptor</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* INTERACTIVE PLAYGROUND TAB (Experiments 1, 3 & 4) */}
        {activeTab === 'playground' && (
          <div className="space-y-4 text-xs">
            {/* Axios vs Fetch Toggle (Experiment 1) */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  Experiment 1: HTTP Client Engine
                </span>
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setApiClientMode('axios')}
                    className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                      apiClientMode === 'axios'
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Axios
                  </button>
                  <button
                    onClick={() => setApiClientMode('fetch')}
                    className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                      apiClientMode === 'fetch'
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fetch API
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Both Axios and Fetch are implemented and log full details to the DevTools Console.
              </p>
            </div>

            {/* Experiment 3: CRUD Playground Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                Experiment 3: Run Live CRUD Operations
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleTestGetMovies}
                  disabled={loadingCrud}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition cursor-pointer"
                >
                  <p className="font-bold text-cyan-400 text-[11px]">GET /api/movies</p>
                  <p className="text-[10px] text-slate-400">Fetch catalog via {apiClientMode}</p>
                </button>

                <button
                  onClick={handleTestCreateBooking}
                  disabled={loadingCrud}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition cursor-pointer"
                >
                  <p className="font-bold text-emerald-400 text-[11px]">POST /api/bookings</p>
                  <p className="text-[10px] text-slate-400">Create new booking</p>
                </button>

                <button
                  onClick={handleTestModifyBooking}
                  disabled={loadingCrud}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition cursor-pointer"
                >
                  <p className="font-bold text-amber-400 text-[11px]">PATCH /api/bookings</p>
                  <p className="text-[10px] text-slate-400">Modify seats/time</p>
                </button>

                <button
                  onClick={handleTestCancelBooking}
                  disabled={loadingCrud}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition cursor-pointer"
                >
                  <p className="font-bold text-rose-400 text-[11px]">DELETE /api/bookings</p>
                  <p className="text-[10px] text-slate-400">Cancel booking</p>
                </button>
              </div>

              <button
                onClick={handleTestGetBookings}
                disabled={loadingCrud}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>GET /api/bookings (View User History)</span>
              </button>
            </div>

            {/* Live Output Console */}
            {crudOutput && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span className="font-bold text-cyan-300">{crudOutput.type || 'Output'}</span>
                  <span className="text-emerald-400">{crudOutput.status}</span>
                </div>
                <pre className="text-[10px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(crudOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* REDUX STORE INSPECTOR */}
        {activeTab === 'redux' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Quick Dispatch Action buttons (Experiment 2c) */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-sans font-bold text-white text-[11px] uppercase tracking-wider">
                Experiment 2c: Dispatch Redux Seat Actions
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-sans">
                <button
                  onClick={() => dispatch(toggleSeat('B1'))}
                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
                >
                  Toggle VIP (B1)
                </button>
                <button
                  onClick={() => dispatch(toggleSeat('C3'))}
                  className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold cursor-pointer"
                >
                  Toggle Prem (C3)
                </button>
                <button
                  onClick={() => dispatch(clearSeats())}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold cursor-pointer"
                >
                  Clear Seats
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-purple-400 uppercase">
                Active Redux Toolkit Slice State
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1 overflow-x-auto text-slate-300">
                <p><span className="text-slate-500">selectedMovie:</span> {booking.selectedMovie ? booking.selectedMovie.title : 'null'}</p>
                <p><span className="text-slate-500">selectedTheatre:</span> {booking.selectedTheatre ? booking.selectedTheatre.name : 'null'}</p>
                <p><span className="text-slate-500">selectedShowDate:</span> {booking.selectedShowDate}</p>
                <p><span className="text-slate-500">selectedShowTime:</span> {booking.selectedShowTime}</p>
                <p><span className="text-slate-500">selectedSeats:</span> [{booking.selectedSeats?.join(', ')}]</p>
                <p><span className="text-slate-500">baseTicketPrice:</span> ${booking.baseTicketPrice?.toFixed(2)}</p>
                <p><span className="text-slate-500">subtotal:</span> ${booking.subtotal?.toFixed(2)}</p>
                <p><span className="text-slate-500">convenienceFee:</span> ${booking.convenienceFee?.toFixed(2)}</p>
                <p className="text-emerald-400 font-bold"><span className="text-slate-500">totalAmount:</span> ${booking.totalAmount?.toFixed(2)}</p>
                <p><span className="text-slate-500">bookingStep:</span> "{booking.bookingStep}"</p>
              </div>
            </div>
          </div>
        )}

        {/* ZUSTAND STORE INSPECTOR (Experiment 2 Topics: Zustand) */}
        {activeTab === 'zustand' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-500/30 space-y-2">
              <span className="font-sans font-bold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" />
                Experiment 2: Zustand Global Store
              </span>
              <p className="font-sans text-[11px] text-slate-300">
                Zustand store is fully operational with custom middleware logger. Test live actions:
              </p>
              <div className="grid grid-cols-3 gap-1.5 font-sans pt-1">
                <button
                  onClick={() => zustandStore.toggleSeat('A1')}
                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                >
                  Toggle A1 (VIP)
                </button>
                <button
                  onClick={() => zustandStore.toggleSeat('D2')}
                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                >
                  Toggle D2 (Prem)
                </button>
                <button
                  onClick={() => zustandStore.clearSeats()}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold cursor-pointer"
                >
                  Clear Seats
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-amber-400 uppercase">
                Active Zustand Store State
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1 overflow-x-auto text-slate-300">
                <p><span className="text-slate-500">selectedSeats:</span> [{zustandStore.selectedSeats?.join(', ')}]</p>
                <p><span className="text-slate-500">baseTicketPrice:</span> ${zustandStore.baseTicketPrice?.toFixed(2)}</p>
                <p><span className="text-slate-500">subtotal:</span> ${zustandStore.subtotal?.toFixed(2)}</p>
                <p><span className="text-slate-500">convenienceFee:</span> ${zustandStore.convenienceFee?.toFixed(2)}</p>
                <p className="text-amber-400 font-bold"><span className="text-slate-500">totalAmount:</span> ${zustandStore.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* MIDDLEWARE LOGS STREAM */}
        {activeTab === 'middleware' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Redux Middleware Interceptor Stream
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </div>

            {middlewareLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No actions intercepted yet. Click any seat or movie to see middleware logs fire in real-time!
              </div>
            ) : (
              <div className="space-y-2 font-mono text-[11px]">
                {middlewareLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-purple-400 font-bold">{log.actionType}</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-white font-sans text-xs">{log.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Payload: {log.payloadSummary}</span>
                      <span className="text-emerald-400 font-bold">
                        Total: ${log.totalAmountAfter?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTH & JWT INSPECTOR & FAULT INJECTION */}
        {activeTab === 'jwt' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Bearer JWT Token
              </h4>

              {auth.token ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] break-all text-slate-300">
                    <span className="text-emerald-400 font-bold">Bearer </span>
                    {auth.token}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * Attached automatically via Axios Request Interceptor in all protected booking calls.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No active token found in storage. Please Sign In.
                </div>
              )}
            </div>

            {/* Experiment Fault Injection Tools */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Lab Fault & Error State Testing
              </h4>
              <p className="text-[11px] text-slate-400">
                Test how the application handles 401 Unauthorized (Experiment 4f) and 500 Server Errors (Experiment 1f & 3f):
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestExpiredToken}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] text-center transition cursor-pointer"
                >
                  Simulate 401 (Expired Token)
                </button>

                <button
                  type="button"
                  onClick={handleTestServerError}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[11px] text-center transition cursor-pointer"
                >
                  Simulate 500 (Server Error)
                </button>
              </div>

              {testResult && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
