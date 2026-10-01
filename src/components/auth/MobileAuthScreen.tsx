import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { playTapSound } from '../../lib/audio';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  status: string;
  phone?: string;
  email?: string;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-maya',
    name: 'Maya Liu',
    username: 'maya',
    avatar: '/assets/maya.png',
    bio: 'Product Designer & Creative Director ✨',
    status: '🐰 Hopping between ideas',
    phone: '+1 (555) 392-0192',
    email: 'maya@bunnytalks.app',
  },
  {
    id: 'user-liam',
    name: 'Liam Chen',
    username: 'liam',
    avatar: '/assets/alex.png',
    bio: 'Sound designer & beats builder 🎧',
    status: '🎵 Cooking fresh beats',
    phone: '+1 (555) 481-9920',
    email: 'liam@bunnytalks.app',
  },
  {
    id: 'user-sophie',
    name: 'Sophie Park',
    username: 'sophie',
    avatar: '/assets/maya.png',
    bio: 'Digital nomad & coffee addict ☕',
    status: '✈️ Exploring Tokyo',
    phone: '+1 (555) 773-1204',
    email: 'sophie@bunnytalks.app',
  },
  {
    id: 'user-noah',
    name: 'Noah Kim',
    username: 'noah',
    avatar: '/assets/alex.png',
    bio: 'Open source contributor & gamer 🎮',
    status: '⚡ Leveling up',
    phone: '+1 (555) 619-3388',
    email: 'noah@bunnytalks.app',
  },
];

interface MobileAuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('maya@bunnytalks.app');
  const [password, setPassword] = useState('bunny123');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/assets/bunny-icon.png');
  const [selectedPresetUser, setSelectedPresetUser] = useState<string>('user-maya');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [authStep, setAuthStep] = useState<'form' | 'verification'>('form');
  const [otpCode, setOtpCode] = useState(['2', '0', '2', '6']);
  const [confirmPassword, setConfirmPassword] = useState('bunny123');

  const avatarChoices = [
    '/assets/bunny-icon.png',
    '/assets/maya.png',
    '/assets/alex.png',
  ];

  const handleQuickLogin = (user: UserProfile) => {
    playTapSound();
    setSelectedPresetUser(user.id);
    setEmailOrPhone(user.email || '');
    setLoading(true);
    setTimeout(() => {
      onLogin(user);
    }, 450);
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpCode];
    updated[index] = clean;
    setOtpCode(updated);
  };

  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setErrorMessage(null);

    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!username.trim()) {
        setErrorMessage('Please choose a bunny handle (username).');
        return;
      }
      if (!emailOrPhone.trim()) {
        setErrorMessage('Please enter your email or phone number.');
        return;
      }
      if (password.length < 4) {
        setErrorMessage('Password must be at least 4 characters.');
        return;
      }
      // Move to verification screen
      setAuthStep('verification');
      return;
    }

    // Direct Login
    handleSubmitLogin();
  };

  const handleSubmitLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const cleanInput = emailOrPhone.toLowerCase().trim();
      const matched = PRESET_USERS.find(
        (u) =>
          u.email?.toLowerCase() === cleanInput ||
          u.username.toLowerCase() === cleanInput ||
          u.name.toLowerCase().includes(cleanInput)
      );

      if (matched) {
        onLogin(matched);
      } else {
        const fallbackUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
          username: emailOrPhone.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'bunny_friend',
          avatar: '/assets/bunny-icon.png',
          bio: 'Active Bunny Talks user 🐰',
          status: '🟢 Online',
          email: emailOrPhone,
        };
        onLogin(fallbackUser);
      }
    }, 500);
  };

  const handleCompleteVerification = () => {
    playTapSound();
    const enteredCode = otpCode.join('');
    if (enteredCode.length < 4) {
      setErrorMessage('Please enter the complete 4-digit code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: fullName.trim(),
        username: username.trim() || fullName.toLowerCase().replace(/\s+/g, '_'),
        avatar: selectedAvatar,
        bio: 'Verified Bunny Explorer ✨',
        status: '🐰 Just joined Bunny Talks!',
        email: emailOrPhone.includes('@') ? emailOrPhone : `${username}@bunnytalks.app`,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : '+1 (555) 000-1234',
      };
      onLogin(newUser);
    }, 600);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar p-4 sm:p-5 bg-gradient-to-b from-[#faf8ff] via-[#f4f0ff] to-[#efe9fc] dark:from-[#13111c] dark:via-[#191626] dark:to-[#120f1e] text-[#1e1a2f] dark:text-[#f2efff] select-none transition-colors duration-300 relative">
      {/* Ambient background glowing orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#ff607d]/15 dark:bg-[#ff607d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-0 w-72 h-72 bg-[#7b5cf5]/15 dark:bg-[#7b5cf5]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Section */}
      <div className="relative z-10 w-full max-w-md mx-auto pt-4 text-center shrink-0">
        {/* Animated Bunny Mascot */}
        <div className="relative inline-block mb-2">
          <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#ff607d] to-[#ff8e72] p-1 shadow-xl shadow-[#ff607d]/30 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-transform duration-300">
            <div className="w-full h-full bg-white dark:bg-[#1a1728] rounded-[22px] flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/bunny-icon.png" 
                alt="Bunny Talks" 
                className="w-13 h-13 sm:w-14 sm:h-14 object-contain animate-bounce"
                style={{ animationDuration: '2.5s' }}
              />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#19b982] text-white shadow-md">
            v2.0 Live
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1d1b2d] dark:text-white">
          Bunny Talks
        </h1>
        <p className="text-xs font-medium text-[#77758a] dark:text-[#a09cb5] mt-0.5 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ff607d]" />
          <span>Next-Gen Community & Voice Messenger</span>
        </p>

        {/* Auth Mode Toggle Pill */}
        <div className="mt-4 p-1 bg-white/80 dark:bg-[#201c30]/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#e6e0f5] dark:border-[#2d2842] flex max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsSignUp(false);
              setAuthStep('form');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isSignUp
                ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-md shadow-[#ff607d]/25'
                : 'text-[#77758a] dark:text-[#a09cb5] hover:text-[#1d1b2d] dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsSignUp(true);
              setAuthStep('form');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSignUp
                ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-md shadow-[#ff607d]/25'
                : 'text-[#77758a] dark:text-[#a09cb5] hover:text-[#1d1b2d] dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Center Form Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-3 shrink-0">
        <div className="bg-white/90 dark:bg-[#1c182b]/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-[#ece7f7] dark:border-[#2c2642]">
          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN UP: OTP VERIFICATION STEP */}
          {isSignUp && authStep === 'verification' ? (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#059669] text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#1d1b2d] dark:text-white">
                  Verify Your Account
                </h3>
                <p className="text-xs text-[#77758a] dark:text-[#a09cb5] mt-1 max-w-xs mx-auto">
                  Enter the 4-digit code sent to <b className="text-bunny-ink dark:text-white">{emailOrPhone}</b>
                </p>
              </div>

              {/* 4-Digit Code Inputs */}
              <div className="flex justify-center gap-3 my-3">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      handleOtpChange(i, e.target.value);
                      if (e.target.value && i < 3) {
                        const nextInput = document.getElementById(`otp-${i + 1}`);
                        nextInput?.focus();
                      }
                    }}
                    className="w-13 h-14 text-center text-xl font-black rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] border-2 border-[#e8e2f7] dark:border-[#352f4f] focus:border-[#ff607d] dark:focus:border-[#ff607d] text-bunny-ink dark:text-white outline-none shadow-sm transition-all"
                  />
                ))}
              </div>

              {/* Quick Auto-Fill Demo Code */}
              <button
                type="button"
                onClick={() => setOtpCode(['2', '0', '2', '6'])}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Auto-Fill Demo Code (2026)</span>
              </button>

              {/* Verify & Launch Button */}
              <button
                type="button"
                onClick={handleCompleteVerification}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white font-extrabold text-sm shadow-xl shadow-[#ff607d]/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Launch Bunny Talks 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Edit Details Back link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthStep('form')}
                  className="text-xs font-semibold text-[#77758a] dark:text-[#a09cb5] hover:text-[#ff607d] transition-colors"
                >
                  ← Edit details or change email
                </button>
              </div>
            </div>
          ) : (
            /* NORMAL FORM (SIGN IN or SIGN UP STEP 1) */
            <form onSubmit={handleProceedToVerification} className="space-y-3.5">
              {isSignUp && (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5] block mb-1">
                      Choose Avatar
                    </label>
                    <div className="flex items-center gap-3">
                      {avatarChoices.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`w-12 h-12 rounded-2xl p-0.5 transition-all overflow-hidden border-2 ${
                            selectedAvatar === av
                              ? 'border-[#ff607d] scale-105 shadow-md shadow-[#ff607d]/30'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt="avatar option" className="w-full h-full object-cover rounded-[14px]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5] block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8f8aa3]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Liu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] border border-[#e8e2f7] dark:border-[#352f4f] text-sm text-[#1d1b2d] dark:text-white placeholder-[#9c97b0] focus:outline-none focus:border-[#ff607d] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5] block mb-1">
                      Bunny Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-[#8f8aa3] text-sm font-bold">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="username"
                        className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] border border-[#e8e2f7] dark:border-[#352f4f] text-sm text-[#1d1b2d] dark:text-white placeholder-[#9c97b0] focus:outline-none focus:border-[#ff607d] transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5] block mb-1">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8f8aa3]" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="maya@bunnytalks.app or +1 555..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] border border-[#e8e2f7] dark:border-[#352f4f] text-sm text-[#1d1b2d] dark:text-white placeholder-[#9c97b0] focus:outline-none focus:border-[#ff607d] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5]">
                    Password
                  </label>
                  {!isSignUp && (
                    <span className="text-[11px] text-[#ff607d] hover:underline cursor-pointer">
                      Forgot code?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8f8aa3]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] border border-[#e8e2f7] dark:border-[#352f4f] text-sm text-[#1d1b2d] dark:text-white placeholder-[#9c97b0] focus:outline-none focus:border-[#ff607d] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#8f8aa3] hover:text-[#ff607d]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white font-extrabold text-sm shadow-xl shadow-[#ff607d]/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Proceed to Verification 🛡️' : 'Hop Right In 🐰'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Tap Demo Switcher */}
          {!isSignUp && (
            <div className="mt-5 pt-4 border-t border-[#eee9f7] dark:border-[#2b2540]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#77758a] dark:text-[#a09cb5]">
                  ⚡ 1-Tap Quick Profiles
                </span>
                <span className="text-[10px] text-[#19b982] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#f7f5fd] dark:bg-[#252038] hover:bg-[#ff607d]/10 dark:hover:bg-[#ff607d]/15 border border-[#e8e2f7] dark:border-[#352f4f] hover:border-[#ff607d]/40 transition-all text-left group cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#e2dcf2] group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1d1b2d] dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-[#77758a] dark:text-[#a09cb5] truncate">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Privacy & Encryption Footer */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pb-6 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1a1728]/70 border border-[#e8e2f7] dark:border-[#2f2945] text-[11px] font-medium text-[#77758a] dark:text-[#a09cb5]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#19b982]" />
          <span>WebRTC P2P Encryption · No Ads · 100% Private</span>
        </div>
      </div>
    </div>
  );
};
