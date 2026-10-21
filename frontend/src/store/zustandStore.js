import { create } from 'zustand';

// Tier surcharges
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

// Zustand Logger Middleware (Topics: Zustand, Middleware, Global State)
const logZustand = (config) => (set, get, api) =>
  config(
    (...args) => {
      const prevState = get();
      set(...args);
      const nextState = get();
      console.log(
        '%c🐻 [Zustand Middleware]%c State Updated:',
        'background: #78350f; color: #fbbf24; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #f3f4f6;',
        {
          seats: nextState.selectedSeats,
          total: nextState.totalAmount,
          movie: nextState.selectedMovie?.title,
          theatre: nextState.selectedTheatre?.name,
        }
      );
    },
    get,
    api
  );

export const useZustandBookingStore = create(
  logZustand((set, get) => ({
    selectedMovie: null,
    selectedTheatre: null,
    selectedShowDate: new Date().toISOString().split('T')[0],
    selectedShowTime: '05:15 PM',
    selectedSeats: [],
    occupiedSeats: [],
    baseTicketPrice: 15.0,
    subtotal: 0,
    convenienceFee: 0,
    totalAmount: 0,

    setMovie: (movie) => {
      console.log('%c🐻 [Zustand Action]%c setMovie:', 'color: #f59e0b; font-weight: bold;', 'color: inherit;', movie.title);
      set((state) => {
        const calc = calculateAmounts(state.baseTicketPrice, []);
        return {
          selectedMovie: movie,
          selectedSeats: [],
          ...calc,
        };
      });
    },

    setTheatre: (theatre) => {
      console.log('%c🐻 [Zustand Action]%c setTheatre:', 'color: #f59e0b; font-weight: bold;', 'color: inherit;', theatre.name);
      set((state) => {
        const basePrice = theatre.basePrice || 15.0;
        const calc = calculateAmounts(basePrice, state.selectedSeats);
        return {
          selectedTheatre: theatre,
          baseTicketPrice: basePrice,
          ...calc,
        };
      });
    },

    setShowDate: (date) => set({ selectedShowDate: date, selectedSeats: [], subtotal: 0, convenienceFee: 0, totalAmount: 0 }),
    setShowTime: (time) => set({ selectedShowTime: time, selectedSeats: [], subtotal: 0, convenienceFee: 0, totalAmount: 0 }),

    toggleSeat: (seatId) => {
      console.log('%c🐻 [Zustand Action]%c toggleSeat:', 'color: #f59e0b; font-weight: bold;', 'color: inherit;', seatId);
      set((state) => {
        let newSeats;
        if (state.selectedSeats.includes(seatId)) {
          newSeats = state.selectedSeats.filter((s) => s !== seatId);
        } else {
          if (state.selectedSeats.length >= 6) {
            console.warn('⚠️ [Zustand Guard] Maximum seat capacity per order reached (6).');
            return state;
          }
          newSeats = [...state.selectedSeats, seatId];
        }
        const calc = calculateAmounts(state.baseTicketPrice, newSeats);
        return {
          selectedSeats: newSeats,
          ...calc,
        };
      });
    },

    clearSeats: () => {
      set((state) => ({
        selectedSeats: [],
        ...calculateAmounts(state.baseTicketPrice, []),
      }));
    },

    setOccupiedSeats: (seats) => set({ occupiedSeats: seats }),
  }))
);
