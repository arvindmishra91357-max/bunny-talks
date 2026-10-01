import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Maximize2, 
  PhoneIncoming, 
  Moon, 
  Sun,
  Sparkles,
  Signal
} from 'lucide-react';
import { playTapSound } from '../../lib/audio';

interface MobileDeviceWrapperProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  onSimulateIncomingCall: () => void;
}

export const MobileDeviceWrapper: React.FC<MobileDeviceWrapperProps> = ({
  children,
  isDark,
  onToggleTheme,
  onSimulateIncomingCall,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [deviceFrameMode, setDeviceFrameMode] = useState<'phone' | 'fullscreen'>(() => {
    // Default to 'phone' frame on desktop for wow factor, fullscreen on mobile
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      return 'fullscreen';
    }
    return 'phone';
  });

  // Keep digital clock live
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 flex flex-col items-center justify-center relative ${
      isDark ? 'bg-[#0f0d18]' : 'bg-[#f0edfa]'
    }`}>
      
      {/* Top Floating Control Bar (Desktop view controls) */}
      <div className="hidden sm:flex items-center gap-2.5 fixed top-3 z-50 px-4 py-2 rounded-full bg-white/80 dark:bg-[#1f1b30]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg text-xs font-bold text-[#1d1b2d] dark:text-white select-none">
        <span className="flex items-center gap-1.5 text-[#ff607d]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bunny Talks Mobile</span>
        </span>

        <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />

        {/* View Toggle */}
        <button
          onClick={() => {
            playTapSound();
            setDeviceFrameMode(deviceFrameMode === 'phone' ? 'fullscreen' : 'phone');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          {deviceFrameMode === 'phone' ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#7b5cf5]" />
              <span>Full Screen View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#7b5cf5]" />
              <span>Mobile Phone Frame</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            playTapSound();
            onToggleTheme();
          }}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#77758a] dark:text-[#a09cb5] hover:text-[#1d1b2d] dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle Dark / Light Mode"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
        </button>

        <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />

        {/* Simulate Incoming Call button */}
        <button
          onClick={() => {
            playTapSound();
            onSimulateIncomingCall();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
          title="Test incoming call screen & ringtone"
        >
          <PhoneIncoming className="w-3.5 h-3.5 animate-pulse" />
          <span>Test Incoming Call</span>
        </button>
      </div>

      {/* Main Container: Either Flagship Phone Frame or Seamless Responsive View */}
      <div 
        className={`w-full transition-all duration-300 relative flex flex-col ${
          deviceFrameMode === 'phone'
            ? 'sm:my-8 sm:w-[412px] sm:h-[840px] sm:max-h-[90vh] sm:rounded-[48px] sm:border-[10px] sm:border-[#221e33] dark:sm:border-[#1a1727] sm:shadow-[0_25px_80px_rgba(0,0,0,0.55)] sm:ring-1 sm:ring-white/10 overflow-hidden'
            : 'max-w-md min-h-screen shadow-2xl overflow-hidden'
        }`}
        style={{
          background: isDark ? '#141122' : '#faf9ff',
          transform: 'translateZ(0)',
        }}
      >
        {/* Realistic Mobile Status Bar with Integrated Dynamic Island */}
        <div 
          className="sticky top-0 z-40 px-6 h-11 flex items-center justify-between text-[11px] font-bold tracking-tight select-none shrink-0 border-b transition-colors"
          style={{
            background: isDark ? 'rgba(20, 17, 34, 0.96)' : 'rgba(250, 249, 255, 0.96)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            color: isDark ? '#ffffff' : '#1d1b2d',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Status Left: Live Digital Clock */}
          <span className="font-semibold tracking-wide">{currentTime || '9:41 AM'}</span>

          {/* Status Center: Sleek Compact Dynamic Island */}
          <div className="flex items-center gap-1.5 px-3 h-5 rounded-full bg-black text-[9px] text-white/90 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#272338]" />
          </div>

          {/* Status Right: 5G, Wi-Fi, Battery */}
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="text-[10px] font-extrabold tracking-wider">5G</span>
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-semibold">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Dedicated Mobile Screen Application Content - No Native Scrollbars */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden no-scrollbar">
          {children}
        </div>

        {/* Bottom Home Indicator Swipe Bar */}
        <div 
          className="w-full py-2 flex justify-center shrink-0 pointer-events-none select-none z-30 transition-colors"
          style={{
            background: isDark ? '#141122' : '#faf9ff',
          }}
        >
          <div className="w-32 h-1 rounded-full bg-black/25 dark:bg-white/25" />
        </div>
      </div>
    </div>
  );
};

