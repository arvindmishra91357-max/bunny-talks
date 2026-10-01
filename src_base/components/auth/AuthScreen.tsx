import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_A, USER_B } from '../../lib/mockData';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, signup, switchUser, forgotPassword, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email.');
        return;
      }
      const ok = await forgotPassword(email.trim());
      if (ok) setForgotSent(true);
      return;
    }

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
      const ok = await login(email.trim(), password.trim());
      if (!ok) setErrorMsg('Login failed. Please check your credentials.');
    } else {
      if (!email.trim() || !username.trim() || !name.trim() || !password.trim()) {
        setErrorMsg('Please fill in all fields (Name, Username, Email, Password).');
        return;
      }
      const cleanUser = username.trim().toLowerCase();
      if (cleanUser.length < 3 || cleanUser.length > 30 || !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
        setErrorMsg('Username must be 3-30 characters with letters, numbers, and underscores only.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      const ok = await signup(name.trim(), cleanUser, email.trim(), password.trim());
      if (!ok) setErrorMsg('Signup failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto select-none font-sans chat-pattern">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-xl mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white m-0">Nexus Chat</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Simple, private 1-to-1 real-time messaging
          </p>
        </div>

        {/* Quick Demo Fast-Login Presets (User A & User B test accounts) */}
        <div className="mb-6 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/25">
          <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Test Account Sign-In:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchUser(USER_A)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors cursor-pointer"
            >
              <img src={USER_A.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-600" alt="" />
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">User A</div>
                <div className="text-[10px] text-emerald-400 font-mono">@arvind</div>
              </div>
            </button>

            <button
              onClick={() => switchUser(USER_B)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors cursor-pointer"
            >
              <img src={USER_B.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-600" alt="" />
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">User B (Rahul)</div>
                <div className="text-[10px] text-emerald-400 font-mono">@rahul123</div>
              </div>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Forgot password success */}
        {forgotSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Password reset instructions sent to your email.</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Unique Username</label>
              <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500">
                <span className="text-slate-400 mr-1 font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="rahul123"
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {mode === 'signup' ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-98 cursor-pointer mt-2"
          >
            <span>
              {mode === 'login' ? 'Sign In to Nexus' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
