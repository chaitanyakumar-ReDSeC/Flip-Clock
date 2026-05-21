/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Clock, Lightbulb } from 'lucide-react';

// --- Types ---
type AppView = 'clock' | 'timer';
type ThemeMode = 'light' | 'dark';

// --- Components ---

const FlipCard = ({ digit, isFinished }: { digit: string | number; isFinished?: boolean }) => {
  return (
    <div className={`glossy-glass w-16 h-28 sm:w-44 sm:h-64 flex items-center justify-center transition-colors duration-150 
      ${isFinished ? 'bg-black/20' : 'bg-[#1e1e1e]'}
    `}>
      <AnimatePresence mode="wait">
        <motion.span
          key={digit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`digit-font text-6xl sm:text-[11rem] transition-colors ${isFinished ? 'text-black' : 'text-[#d1d1d1]'}`}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const DigitPair = ({ value, isFinished }: { value: number; isFinished?: boolean }) => {
  const str = value.toString().padStart(2, '0');
  return (
    <div className="flex gap-1 sm:gap-3">
      <FlipCard digit={str[0]} isFinished={isFinished} />
      <FlipCard digit={str[1]} isFinished={isFinished} />
    </div>
  );
};

const Colon = ({ isFinished }: { isFinished?: boolean }) => (
  <div className="flex flex-col gap-4 sm:gap-8 px-1 sm:px-3">
    <div className={`w-2 h-2 sm:w-4 sm:h-4 rounded-sm transition-colors ${isFinished ? 'bg-black' : 'bg-[#333]'}`} />
    <div className={`w-2 h-2 sm:w-4 sm:h-4 rounded-sm transition-colors ${isFinished ? 'bg-black' : 'bg-[#333]'}`} />
  </div>
);

export default function App() {
  const [view, setView] = useState<AppView>('clock');
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer State
  const [timerInputs, setTimerInputs] = useState({ h: 0, m: 0, s: 10 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // --- Feature: Fullscreen Logic ---
  const toggleFullScreen = useCallback((e: React.MouseEvent) => {
    // Prevent fullscreen toggle if clicking buttons, inputs, or the toggle switch
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('.cursor-pointer')
    ) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // --- Feature: Stay Awake (Screen Wake Lock) ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // Silently fail if not supported
      }
    };

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  // Update Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    if (!isTimerRunning && timeLeft === 0) {
      const total = timerInputs.h * 3600 + timerInputs.m * 60 + timerInputs.s;
      if (total > 0) {
        setHasStarted(true);
        setTimeLeft(total);
        setIsTimerRunning(true);
      }
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  }, [isTimerRunning, timeLeft, timerInputs]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimeLeft(0);
    setHasStarted(false);
  }, []);

  // --- UI Formatting ---
  const dateStr = useMemo(() => {
    const day = currentTime.getDate();
    const month = currentTime.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const year = currentTime.getFullYear();
    return `${day} ${month} ${year}`;
  }, [currentTime]);

  const weekdayStr = useMemo(() => {
    return currentTime.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  }, [currentTime]);

  const isEmergency = isTimerRunning && timeLeft <= 10 && timeLeft > 0;
  const isEmergencyRed = isEmergency && timeLeft % 2 === 0;
  const isFinished = hasStarted && timeLeft === 0 && !isTimerRunning;

  const showHaltColors = isEmergencyRed || isFinished;

  return (
    <div 
      onDoubleClick={toggleFullScreen}
      className={`min-h-screen transition-all duration-150 flex flex-col 
        ${mode === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}
        ${showHaltColors ? 'bg-red-600 !text-black' : ''}
      `}
    >
      {/* Header */}
      <header className="p-6 sm:p-10 flex justify-between items-center">
        <div className="w-24 hidden sm:block" />

        <div className="text-center flex items-center gap-4 sm:gap-8">
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-[0.1em] transition-colors ${showHaltColors ? 'text-black' : ''}`}>
            {dateStr}
          </h2>
          <span className={`text-2xl sm:text-4xl font-light opacity-30 ${showHaltColors ? 'text-black opacity-50' : ''}`}>|</span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-[0.1em] transition-colors ${showHaltColors ? 'text-black' : ''}`}>
            {weekdayStr}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-1 group cursor-pointer" onClick={() => setView(view === 'clock' ? 'timer' : 'clock')}>
          <div className={`h-0.5 bg-current transition-all ${view === 'timer' ? 'w-8' : 'w-6'} ${showHaltColors ? 'bg-black' : ''}`} />
          <div className={`h-0.5 bg-current transition-all ${view === 'timer' ? 'w-6' : 'w-8'} ${showHaltColors ? 'bg-black' : ''}`} />
          {view === 'clock' ? (
            <Timer className={`mt-2 w-8 h-8 opacity-70 hover:opacity-100 transition-all ${showHaltColors ? 'text-black' : ''}`} />
          ) : (
            <Clock className={`mt-2 w-8 h-8 opacity-70 hover:opacity-100 transition-all ${showHaltColors ? 'text-black' : ''}`} />
          )}
        </div>
      </header>

      {/* Main Display */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {view === 'clock' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="flex items-center gap-2 sm:gap-6">
              <DigitPair value={currentTime.getHours()} isFinished={showHaltColors} />
              <Colon isFinished={showHaltColors} />
              <DigitPair value={currentTime.getMinutes()} isFinished={showHaltColors} />
              <Colon isFinished={showHaltColors} />
              <DigitPair value={currentTime.getSeconds()} isFinished={showHaltColors} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-12 w-full max-w-4xl"
          >
            <div className="flex items-center gap-2 sm:gap-6">
              <DigitPair value={Math.floor(timeLeft / 3600)} isFinished={showHaltColors} />
              <Colon isFinished={showHaltColors} />
              <DigitPair value={Math.floor((timeLeft % 3600) / 60)} isFinished={showHaltColors} />
              <Colon isFinished={showHaltColors} />
              <DigitPair value={timeLeft % 60} isFinished={showHaltColors} />
            </div>

            {/* Timer Inputs */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-md">
              {(['h', 'm', 's'] as const).map((unit) => (
                <div key={unit} className="flex flex-col items-center gap-2">
                  <label className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${showHaltColors ? 'text-black/60' : 'text-gray-500'}`}>
                    {unit === 'h' ? 'Hours' : unit === 'm' ? 'Minutes' : 'Seconds'}
                  </label>
                  <input
                    type="number"
                    value={timerInputs[unit]}
                    onChange={(e) => setTimerInputs({ ...timerInputs, [unit]: Math.max(0, parseInt(e.target.value) || 0) })}
                    disabled={isTimerRunning}
                    className={`w-full bg-transparent border-b-2 text-center text-3xl sm:text-4xl font-display font-medium outline-none transition-colors 
                      ${showHaltColors ? 'border-black/30' : 'border-gray-800'}
                      ${mode === 'dark' ? 'focus:border-white' : 'focus:border-black'}
                      ${isTimerRunning ? 'opacity-50' : 'opacity-100'}
                    `}
                  />
                </div>
              ))}
            </div>

            {/* Timer Controls */}
            <div className="flex gap-6 mt-4">
              <button
                onClick={toggleTimer}
                className={`px-12 py-4 font-bold uppercase tracking-widest rounded-sm transition-all active:scale-95
                  ${showHaltColors 
                    ? 'bg-black text-red-600' 
                    : mode === 'dark' 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-black text-white hover:bg-gray-800'}
                `}
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className={`px-12 py-4 border-2 font-bold uppercase tracking-widest rounded-sm transition-all active:scale-95
                  ${showHaltColors
                    ? 'border-black text-black hover:bg-black hover:text-red-600'
                    : mode === 'dark' 
                      ? 'border-white text-white hover:bg-white hover:text-black' 
                      : 'border-black text-black hover:bg-black hover:text-white'}
                `}
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-10 flex justify-end items-center">
        <button 
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-90"
        >
          <Lightbulb className={`w-12 h-12 transition-colors ${mode === 'light' ? 'fill-yellow-400 text-yellow-500' : 'text-white'} ${showHaltColors ? '!text-black' : ''}`} />
        </button>
      </footer>
    </div>
  );
}