import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../lib/mockData';
import { Profile } from '../../types';
import { BunnyLogo } from '../common/BunnyLogo';

export const AuthScreen: React.FC = () => {
  const { login, register, loginAs } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim() || !username.trim()) {
          setError('Please provide both your display name and a bunny username.');
          setLoading(false);
          return;
        }
        await register(email, password, displayName, username);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-bunny-surface via-bunny-bg to-bunny-surface text-bunny-text">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-bunny-coral/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-bunny-secondary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <BunnyLogo size="lg" animate />
          </div>
          <p className="text-xs uppercase tracking-widest font-extrabold text-bunny-coral mt-2">
            The Friendly Social Messenger
          </p>
          <h2 className="text-2xl font-black text-bunny-text mt-1">
            {isSignUp ? 'Join the Bunny Burrow' : 'Welcome back, Friend!'}
          </h2>
          <p className="text-sm text-bunny-muted mt-1">
            {isSignUp
              ? 'Connect, hop into conversations & share daily Sparks.'
              : 'Sign in to jump straight back into your conversations.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bunny-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-bunny-border/50 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-bunny-muted" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Maya Lin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                    Bunny Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-bunny-muted text-sm font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="mayalin"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-bunny-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@bunnytalks.app"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link simulated to your inbox!')}
                    className="text-xs font-semibold text-bunny-coral hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-bunny-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-bunny-coral to-bunny-primary hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-bunny-coral/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Bunny Account' : 'Hop Right In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-medium text-bunny-muted hover:text-bunny-coral transition-colors"
            >
              {isSignUp ? (
                <span>
                  Already have an account? <strong className="text-bunny-coral underline">Log in</strong>
                </span>
              ) : (
                <span>
                  Don't have an account? <strong className="text-bunny-coral underline">Join Bunny Talks</strong>
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bunny-border/40" />
            </div>
            <span className="relative px-3 bg-white dark:bg-bunny-card text-[11px] font-bold text-bunny-muted uppercase tracking-wider">
              Quick Demo Logins
            </span>
          </div>

          {/* One-click demo accounts */}
          <div className="grid grid-cols-3 gap-2">
            {mockUsers.slice(0, 3).map((user: Profile) => (
              <button
                key={user.id}
                type="button"
                onClick={() => loginAs(user)}
                className="flex flex-col items-center p-2 rounded-2xl border border-bunny-border/40 hover:border-bunny-coral/50 bg-bunny-surface/40 hover:bg-bunny-coral/5 transition-all group"
              >
                <img
                  src={user.avatar_url || user.avatarUrl}
                  alt={user.display_name || user.name}
                  className="w-8 h-8 rounded-full object-cover border border-bunny-border group-hover:scale-105 transition-transform"
                />
                <span className="text-[11px] font-bold text-bunny-text mt-1 truncate max-w-full">
                  {(user.display_name || user.name).split(' ')[0]}
                </span>
                <span className="text-[9px] text-bunny-muted">@{user.username}</span>
              </button>
            ))}
          </div>

          {/* Privacy badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-bunny-muted/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Encrypted & Privacy First</span>
          </div>
        </div>
      </div>
    </div>
  );
};
