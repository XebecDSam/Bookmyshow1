// Global buffer of latest middleware logs accessible by the Experiment Inspector
export const recentMiddlewareLogs = [];

export const bookingMiddleware = (storeAPI) => (next) => (action) => {
  // Let the action execute through the reducers first
  const result = next(action);

  // Filter for booking actions (Topics: Redux Toolkit, Middleware, Global State)
  if (typeof action?.type === 'string' && action.type.startsWith('booking/')) {
    const currentState = storeAPI.getState().booking;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

    let summary = `Intercepted booking action: ${action.type}`;
    if (action.type === 'booking/toggleSeat') {
      summary = `Seat toggled (${action.payload}). Seats now: ${currentState.selectedSeats?.length || 0}/6`;
    } else if (action.type === 'booking/setMovie') {
      summary = `Movie changed to "${currentState.selectedMovie?.title}". Resetting seats.`;
    } else if (action.type === 'booking/setTheatre') {
      summary = `Theatre changed to "${currentState.selectedTheatre?.name}". Base: $${currentState.baseTicketPrice}`;
    } else if (action.type === 'booking/setShowTime') {
      summary = `Showtime updated to ${action.payload}`;
    } else if (action.type === 'booking/setBookingStep') {
      summary = `Navigated booking step -> ${action.payload}`;
    }

    // Rich Console Output (Visible in Webpage Console)
    console.log(
      `%c🔄 [Redux Middleware] %c${action.type}`,
      'background: #7c3aed; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #a78bfa; font-weight: bold;',
      {
        action,
        selectedSeats: currentState.selectedSeats,
        computedSubtotal: currentState.subtotal,
        computedTotal: currentState.totalAmount,
      }
    );

    const logEntry = {
      id: `mw-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeFormatted,
      actionType: action.type,
      summary,
      payloadSummary: action.payload !== undefined ? JSON.stringify(action.payload).substring(0, 50) : 'none',
      seatCountAfter: currentState.selectedSeats?.length || 0,
      totalAmountAfter: currentState.totalAmount || 0,
    };

    recentMiddlewareLogs.unshift(logEntry);
    if (recentMiddlewareLogs.length > 30) {
      recentMiddlewareLogs.pop();
    }

    // Dispatch custom browser event to update any listening UI components (like the Inspector)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('redux:middleware:log', {
          detail: logEntry,
        })
      );
    }

    // Persist active draft to sessionStorage (Experiment 2f: Maintain booking state)
    try {
      if (currentState.selectedMovie || (currentState.selectedSeats && currentState.selectedSeats.length > 0)) {
        sessionStorage.setItem(
          'cinepass_draft_booking',
          JSON.stringify({
            movieId: currentState.selectedMovie?.id,
            theatreId: currentState.selectedTheatre?.id,
            showTime: currentState.selectedShowTime,
            selectedSeats: currentState.selectedSeats,
          })
        );
      }
    } catch (e) {
      console.error('Middleware persistence error', e);
    }
  }

  return result;
};
