import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginSuccess, authStart, authFailure } from '../store/authSlice';
import { movieApi } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading, authError } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || (mode === 'register' && !name)) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    try {
      dispatch(authStart());
      let result;

      if (mode === 'login') {
        result = await movieApi.login({ email, password });
      } else {
        result = await movieApi.register({ name, email, password });
      }

      dispatch(loginSuccess(result));

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err?.response?.data?.message || 'Authentication request failed.';
      setLocalError(msg);
      dispatch(authFailure(msg));
    }
  };

  const handleQuickLogin = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setMode('login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080d]/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#111520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f84464]/20 text-[#f84464] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {mode === 'login' ? 'BookMyShow Sign In' : 'Create BMS Account'}
              </h3>
              <p className="text-xs text-slate-400">
                Unlock exclusive ticket offers and fast checkout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switch */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-[#090b10] rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setMode('login');
                setLocalError(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#f84464] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setLocalError(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#f84464] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#f84464]" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f84464]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#f84464]" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@bookmyshow.com"
              className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f84464]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#f84464]" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#090b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f84464]"
            />
          </div>

          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-[#f84464] shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-[#f84464] hover:bg-[#e03251] text-white text-xs font-black shadow-lg shadow-[#f84464]/30 hover:scale-102 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>{mode === 'login' ? 'Sign In with JWT' : 'Create Account'}</span>
          </button>

          {/* Quick Demo Accounts */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('john@example.com', 'password123')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <p className="font-bold text-[#f84464]">👤 John Doe</p>
                <p className="text-[10px] text-slate-500 truncate">john@example.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@cinema.com', 'admin123')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <p className="font-bold text-amber-400">🛡️ Cinema Admin</p>
                <p className="text-[10px] text-slate-500 truncate">admin@cinema.com</p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
