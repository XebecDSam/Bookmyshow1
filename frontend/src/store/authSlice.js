import { createSlice } from '@reduxjs/toolkit';

// Read initial token & user from localStorage safely
const getSavedToken = () => {
  try {
    return localStorage.getItem('cinepass_token');
  } catch {
    return null;
  }
};

const getSavedUser = () => {
  try {
    const raw = localStorage.getItem('cinepass_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = getSavedToken();
const initialUser = getSavedUser();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  authError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.isLoading = true;
      state.authError = null;
    },
    // Experiment 4a & 4b: Login success and token storage
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authError = null;
      try {
        localStorage.setItem('cinepass_token', action.payload.token);
        localStorage.setItem('cinepass_user', JSON.stringify(action.payload.user));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    },
    authFailure: (state, action) => {
      state.isLoading = false;
      state.authError = action.payload;
    },
    // Experiment 4e: Implement logout and token removal
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.authError = null;
      try {
        localStorage.removeItem('cinepass_token');
        localStorage.removeItem('cinepass_user');
      } catch (e) {
        console.error('Failed to remove from localStorage', e);
      }
    },
    clearAuthError: (state) => {
      state.authError = null;
    },
  },
});

export const { authStart, loginSuccess, authFailure, logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
