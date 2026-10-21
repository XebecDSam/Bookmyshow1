import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { toggleSeat, clearSeats, setMovie } from './store/bookingSlice';
import { useZustandBookingStore } from './store/zustandStore';
import { movieApi } from './services/api';
import { registerServiceWorker } from './pwa/pwaManager';
import App from './App.jsx';
import './index.css';

// Initialize BookMyShow PWA Service Worker
registerServiceWorker();

// =========================================================================
// GLOBAL BROWSER DEVTOOLS CONSOLE TEST SUITE (Topics: All 4 Experiments)
// Evaluators and developers can open F12 console and run window.BookMyShow commands
// =========================================================================
if (typeof window !== 'undefined') {
  const bmsHelper = {
    help() {
      console.log(
        '%c🎬 BookMyShow Lab Console Commands:%c\n' +
        '  1. BookMyShow.testAxios()              -> Test Experiment 1 (Axios async GET)\n' +
        '  2. BookMyShow.testFetch()              -> Test Experiment 1 (Fetch API async GET)\n' +
        '  3. BookMyShow.testRedux(seat)          -> Test Experiment 2 (Redux Toolkit dispatch + middleware)\n' +
        '  4. BookMyShow.testZustand(seat)        -> Test Experiment 2 (Zustand store dispatch + middleware)\n' +
        '  5. BookMyShow.testCreateBooking()      -> Test Experiment 3 (POST /api/bookings)\n' +
        '  6. BookMyShow.testModifyBooking(id)    -> Test Experiment 3 (PATCH /api/bookings/:id)\n' +
        '  7. BookMyShow.testCancelBooking(id)    -> Test Experiment 3 (DELETE /api/bookings/:id)\n' +
        '  8. BookMyShow.testLogin()              -> Test Experiment 4 (POST /api/auth/login + Token save)\n' +
        '  9. BookMyShow.test401ExpiredToken()    -> Test Experiment 4 (Simulate 401 & Axios response interceptor)\n' +
        ' 10. BookMyShow.test500ServerError()     -> Test Experiment 1 & 3 (Loading & 500 error state)\n' +
        ' 11. BookMyShow.getState()               -> Inspect both Redux & Zustand stores',
        'color: #f84464; font-weight: bold; font-size: 14px;',
        'color: #38bdf8; font-family: monospace; font-size: 11px;'
      );
      return 'Type any command above and hit Enter to test!';
    },

    async testAxios() {
      console.log('%c[Test] Testing Axios GET /api/movies...', 'color: #38bdf8; font-weight: bold;');
      const res = await movieApi.getMovies();
      console.table(res.movies?.map((m) => ({ ID: m.id, Title: m.title, Rating: m.rating, Runtime: m.runtime })));
      return res;
    },

    async testFetch() {
      console.log('%c[Test] Testing native Fetch API GET /api/movies...', 'color: #22d3ee; font-weight: bold;');
      const res = await movieApi.getMoviesWithFetch();
      console.table(res.movies?.map((m) => ({ ID: m.id, Title: m.title, Genres: m.genres.join(', ') })));
      return res;
    },

    testRedux(seatId = 'C4') {
      console.log(`%c[Test] Dispatching toggleSeat('${seatId}') via Redux Toolkit...`, 'color: #a855f7; font-weight: bold;');
      store.dispatch(toggleSeat(seatId));
      return store.getState().booking;
    },

    testZustand(seatId = 'D5') {
      console.log(`%c[Test] Dispatching toggleSeat('${seatId}') via Zustand Store...`, 'color: #10b981; font-weight: bold;');
      useZustandBookingStore.getState().toggleSeat(seatId);
      return useZustandBookingStore.getState();
    },

    async testCreateBooking() {
      console.log('%c[Test] Creating mock booking via POST /api/bookings...', 'color: #f59e0b; font-weight: bold;');
      const payload = {
        movieId: 'mov-1',
        theatreId: 'th-1',
        showDate: new Date().toISOString().split('T')[0],
        showTime: '05:15 PM',
        seats: ['C4', 'C5'],
        paymentMethod: 'Credit Card (**** 4242)',
      };
      const res = await movieApi.createBooking(payload);
      console.log('%c[Booking Created Successfully]:', 'color: #10b981;', res);
      return res;
    },

    async testModifyBooking(id) {
      const targetId = id || '101';
      console.log(`%c[Test] Modifying booking #${targetId} via PATCH /api/bookings/${targetId}...`, 'color: #f59e0b; font-weight: bold;');
      const res = await movieApi.modifyBooking(targetId, { showTime: '09:00 PM', seats: ['A1', 'A2'] });
      console.log('%c[Booking Modified Successfully]:', 'color: #10b981;', res);
      return res;
    },

    async testCancelBooking(id) {
      const targetId = id || '101';
      console.log(`%c[Test] Cancelling booking #${targetId} via DELETE /api/bookings/${targetId}...`, 'color: #ef4444; font-weight: bold;');
      const res = await movieApi.cancelBooking(targetId);
      console.log('%c[Booking Cancelled Successfully]:', 'color: #10b981;', res);
      return res;
    },

    async testLogin(email = 'john@example.com', password = 'password123') {
      console.log(`%c[Test] Authenticating ${email} via POST /api/auth/login...`, 'color: #3b82f6; font-weight: bold;');
      const res = await movieApi.login({ email, password });
      console.log('%c[JWT Bearer Token Received]:', 'color: #10b981;', res.token);
      return res;
    },

    async test401ExpiredToken() {
      console.log('%c[Test] Simulating 401 Unauthorized token response...', 'color: #ef4444; font-weight: bold;');
      localStorage.setItem('cinepass_token', 'simulated_expired_token');
      try {
        await movieApi.getBookings();
      } catch (err) {
        console.log('%c[401 Caught and Token Purged by Interceptor]:', 'color: #f59e0b;', err.message);
      }
      return '401 Unauthorized handling demonstrated.';
    },

    async test500ServerError() {
      console.log('%c[Test] Simulating 500 Internal Server Error response...', 'color: #ef4444; font-weight: bold;');
      try {
        await movieApi.testError(500);
      } catch (err) {
        console.log('%c[500 Server Error Response Caught]:', 'color: #ef4444;', err.response?.data);
      }
      return '500 error state demonstrated.';
    },

    getState() {
      return {
        reduxStore: store.getState(),
        zustandStore: useZustandBookingStore.getState(),
        token: localStorage.getItem('cinepass_token'),
      };
    },
  };

  window.BookMyShow = bmsHelper;
  window.CinePass = bmsHelper; // Keep backward compatibility

  // Print welcoming banner in console
  console.log(
    '%c🎬 BOOKMYSHOW PWA CONSOLE READY! %c\n' +
    'PWA & API Features Active:\n' +
    '  ✔ Progressive Web App (PWA) Service Worker & Offline Cache\n' +
    '  ✔ Web App Manifest with App Shortcuts & Maskable Icons\n' +
    '  ✔ Axios & Fetch API with Request/Response Interceptors\n' +
    '  ✔ Redux Toolkit & Zustand Global State with Middleware\n' +
    '  ✔ Full CRUD Operations (GET, POST, PATCH, DELETE)\n' +
    '  ✔ Secure JWT Authentication, Protected APIs & Error States\n\n' +
    '👉 Type %cBookMyShow.help()%c in this console to run tests interactively!',
    'background: #f84464; color: #fff; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;',
    'color: #38bdf8; font-size: 11px;',
    'color: #fbbf24; font-weight: bold; text-decoration: underline;',
    'color: #38bdf8;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
