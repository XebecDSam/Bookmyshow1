import { createSlice } from '@reduxjs/toolkit';

// Seat tier surcharges
const SEAT_TIER_SURCHARGE = {
  A: 6.0,
  B: 6.0,
  C: 3.0,
  D: 3.0,
  E: 3.0,
  F: 0.0,
  G: 0.0,
  H: 0.0,
};

// Calculate prices helper (Experiment 2d)
const calculateAmounts = (basePrice, seats) => {
  let subtotal = 0;
  for (const seat of seats) {
    const row = seat.charAt(0).toUpperCase();
    const surcharge = SEAT_TIER_SURCHARGE[row] ?? 0;
    subtotal += basePrice + surcharge;
  }
  const convenienceFee = Number((subtotal * 0.1).toFixed(2));
  const totalAmount = Number((subtotal + convenienceFee).toFixed(2));
  return {
    subtotal: Number(subtotal.toFixed(2)),
    convenienceFee,
    totalAmount,
  };
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const initialState = {
  selectedMovie: null,
  selectedTheatre: null,
  selectedShowDate: getTodayString(),
  selectedShowTime: '05:15 PM',
  selectedSeats: [],
  occupiedSeats: [],
  baseTicketPrice: 15.0,
  subtotal: 0,
  convenienceFee: 0,
  totalAmount: 0,
  bookingStep: 'movie-selection', // 'movie-selection' | 'theatre-selection' | 'seat-selection' | 'checkout' | 'confirmation'
  lastConfirmedBooking: null,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Experiment 2b: Manage selected movie
    setMovie: (state, action) => {
      state.selectedMovie = action.payload;
      state.selectedSeats = [];
      const calc = calculateAmounts(state.baseTicketPrice, []);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    // Experiment 2b: Manage selected theatre
    setTheatre: (state, action) => {
      state.selectedTheatre = action.payload;
      state.baseTicketPrice = action.payload.basePrice;
      if (action.payload.showtimes && action.payload.showtimes.length > 0) {
        if (!action.payload.showtimes.includes(state.selectedShowTime)) {
          state.selectedShowTime = action.payload.showtimes[0];
        }
      }
      const calc = calculateAmounts(state.baseTicketPrice, state.selectedSeats);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    // Experiment 2b: Manage show timing and date
    setShowDate: (state, action) => {
      state.selectedShowDate = action.payload;
      state.selectedSeats = [];
      const calc = calculateAmounts(state.baseTicketPrice, []);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    setShowTime: (state, action) => {
      state.selectedShowTime = action.payload;
      state.selectedSeats = [];
      const calc = calculateAmounts(state.baseTicketPrice, []);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    // Experiment 2c: Implement actions for selecting seats
    selectSeat: (state, action) => {
      const seat = action.payload;
      if (!state.selectedSeats.includes(seat) && state.selectedSeats.length < 6) {
        state.selectedSeats.push(seat);
        const calc = calculateAmounts(state.baseTicketPrice, state.selectedSeats);
        state.subtotal = calc.subtotal;
        state.convenienceFee = calc.convenienceFee;
        state.totalAmount = calc.totalAmount;
      }
    },

    // Experiment 2c: Implement actions for removing seats
    removeSeat: (state, action) => {
      const seat = action.payload;
      state.selectedSeats = state.selectedSeats.filter((s) => s !== seat);
      const calc = calculateAmounts(state.baseTicketPrice, state.selectedSeats);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    // Experiment 2c & 2d: Toggle seat with auto recalculation of ticket price & total booking amount
    toggleSeat: (state, action) => {
      const seat = action.payload;
      if (state.selectedSeats.includes(seat)) {
        state.selectedSeats = state.selectedSeats.filter((s) => s !== seat);
      } else {
        if (state.selectedSeats.length >= 6) {
          return; // Max 6 seats limit per booking
        }
        state.selectedSeats.push(seat);
      }
      const calc = calculateAmounts(state.baseTicketPrice, state.selectedSeats);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    clearSeats: (state) => {
      state.selectedSeats = [];
      const calc = calculateAmounts(state.baseTicketPrice, []);
      state.subtotal = calc.subtotal;
      state.convenienceFee = calc.convenienceFee;
      state.totalAmount = calc.totalAmount;
    },

    setOccupiedSeats: (state, action) => {
      state.occupiedSeats = action.payload;
    },

    setBookingStep: (state, action) => {
      state.bookingStep = action.payload;
    },

    setConfirmedBooking: (state, action) => {
      state.lastConfirmedBooking = action.payload;
      state.bookingStep = 'confirmation';
    },

    resetBooking: (state) => {
      state.selectedMovie = null;
      state.selectedTheatre = null;
      state.selectedSeats = [];
      state.subtotal = 0;
      state.convenienceFee = 0;
      state.totalAmount = 0;
      state.bookingStep = 'movie-selection';
      state.lastConfirmedBooking = null;
    },
  },
});

export const {
  setMovie,
  setTheatre,
  setShowDate,
  setShowTime,
  selectSeat,
  removeSeat,
  toggleSeat,
  clearSeats,
  setOccupiedSeats,
  setBookingStep,
  setConfirmedBooking,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
