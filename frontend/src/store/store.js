import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';
import { bookingMiddleware } from './middleware/bookingMiddleware';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bookingMiddleware),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
