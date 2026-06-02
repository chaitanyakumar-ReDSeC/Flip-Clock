/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Hourglass, Github } from 'lucide-react';

// --- Types ---
type AppView = 'clock' | 'timer';
type ThemeMode = 'dark' | 'light';
type DialUnit = 'h' | 'm' | 's' | null;

// --- Components ---

const LoadingScreen = ({ onFinish }: { onFinish: () => void }) => (
  <motion.div 
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ delay: 2.8, duration: 0.8 }}
    onAnimationComplete={onFinish}
    className="fixed inset-0 z-[100] bg-[#080808] flex items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [1, 1.2, 1], opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="p-8 rounded-full border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
    >
      <Github className="w-20 h-20 text-white" />
    </motion.div>
  </motion.div>
);

const FlipCard = ({ digit, isFinished }: { digit: string | number; isFinished?: boolean }) => {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [prevDigit, setPrevDigit] = useState(digit);

  useEffect(() => {
    if (digit !== displayDigit) {
      setPrevDigit(displayDigit);
      setDisplayDigit(digit);
    }
  }, [digit, displayDigit]);

  useEffect(() => {
    setDisplayDigit(digit);
    setPrevDigit(digit);
  }, [isFinished]);

  return (
    <div className="relative w-[11vw] h-[16.5vw] min-w-16 min-h-24 max-w-44 max-h-60" style={{ perspective: '1000px' }}>
      <div className={`absolute inset-0 h-1/2 w-full overflow-hidden rounded-t-xl lg:rounded-t-2xl border-b border-black/30 transition-colors duration-300 ${isFinished ? 'bg-red-950/40' : 'bg-[#161616]'}`}>
        <div className="flex h-[16.5vw] min-h-24 max-h-60 items-center justify-center">
          <span className={`digit-font text-[9.5vw] lg:text-[10rem] font-medium leading-none ${isFinished ? 'text-black' : 'text-[#e2e2e2]'}`}>
            {displayDigit}
          </span>
        </div>
      </div>
      <div className={`absolute bottom-0 h-1/2 w-full overflow-hidden rounded-b-xl lg:rounded-b-2xl transition-colors duration-300 ${isFinished ? 'bg-red-950/40' : 'bg-[#161616]'}`}>
        <div className="flex h-[16.5vw] min-h-24 max-h-60 items-center justify-center -translate-y-1/2">
          <span className={`digit-font text-[9.5vw] lg:text-[10rem] font-medium leading-none ${isFinished ? 'text-black' : 'text-[#e2e2e2]'}`}>
            {prevDigit}
          </span>
        </div>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={displayDigit}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -180 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'bottom', backfaceVisibility: 'hidden', zIndex: 30 }}
          className={`absolute top-0 h-1/2 w-full overflow-hidden rounded-t-xl lg:rounded-t-2xl border-b border-black/40 ${isFinished ? 'bg-red-950/40' : 'bg-[#161616]'}`}
        >
          <div className="flex h-[16.5vw] min-h-24 max-h-60 items-center justify-center">
            <span className={`digit-font text-[9.5vw] lg:text-[10rem] font-medium leading-none ${isFinished ? 'text-black' : 'text-[#e2e2e2]'}`}>
              {prevDigit}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`revealed-${displayDigit}`}
          initial={{ rotateX: 180 }}
          animate={{ rotateX: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'top', backfaceVisibility: 'hidden', zIndex: 25 }}
          className={`absolute bottom-0 h-1/2 w-full overflow-hidden rounded-b-xl lg:rounded-b-2xl ${isFinished ? 'bg-red-950/40' : 'bg-[#161616]'}`}
        >
          <div className="flex h-[16.5vw] min-h-24 max-h-60 items-center justify-center -translate-y-1/2">
            <span className={`digit-font text-[9.5vw] lg:text-[10rem] font-medium leading-none ${isFinished ? 'text-black' : 'text-[#e2e2e2]'}`}>
              {displayDigit}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/40 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
    </div>
  );
};

const DigitPair = ({ value, isFinished }: { value: number; isFinished?: boolean }) => {
  const str = value.toString().padStart(2, '0');
  return (
    <div className="flex gap-1.5 lg:gap-3">
      <FlipCard digit={str[0]} isFinished={isFinished} />
      <FlipCard digit={str[1]} isFinished={isFinished} />
    </div>
  );
};

const Colon = ({ isFinished }: { isFinished?: boolean }) => (
  <div className="flex flex-col gap-4 lg:gap-6 px-3 lg:px-6 justify-center items-center">
    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-colors ${isFinished ? 'bg-black' : 'bg-[#3a3a3a]'}`} />
    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-colors ${isFinished ? 'bg-black' : 'bg-[#3a3a3a]'}`} />
  </div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<AppView>('clock');
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [timerInputs, setTimerInputs] = useState({ h: 0, m: 0, s: 10 });
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [activeDial, setActiveDial] = useState<DialUnit>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.dial-trigger')) return;
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (document.exitFullscreen) document.exitFullscreen();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleDialMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeDial || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    let degree = (angle * 180) / Math.PI + 90;
    if (degree < 0) degree += 360;

    const maxVal = activeDial === 'h' ? 24 : 60;
    const newVal = Math.round((degree / 360) * maxVal) % maxVal;

    setTimerInputs(prev => {
      const updated = { ...prev, [activeDial]: newVal };
      if (!isTimerRunning && !hasStarted) {
        setTimeLeft(updated.h * 3600 + updated.m * 60 + updated.s);
      }
      return updated;
    });
  }, [activeDial, isTimerRunning, hasStarted]);

  useEffect(() => {
    if (activeDial) {
      const move = (e: MouseEvent | TouchEvent) => handleDialMove(e);
      const end = () => setActiveDial(null);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', end);
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', end);
      };
    }
  }, [activeDial, handleDialMove]);

  const toggleTimer = () => {
    if (!isTimerRunning && timeLeft === 0) {
      const total = timerInputs.h * 3600 + timerInputs.m * 60 + timerInputs.s;
      if (total > 0) { setHasStarted(true); setTimeLeft(total); setIsTimerRunning(true); }
    } else {
      if (!hasStarted) setHasStarted(true);
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setHasStarted(false);
    setTimeLeft(timerInputs.h * 3600 + timerInputs.m * 60 + timerInputs.s);
  };

  const isEmergency = isTimerRunning && timeLeft <= 10 && timeLeft > 0;
  const showHaltColors = view === 'timer' && ((isEmergency && timeLeft % 2 === 0) || (hasStarted && timeLeft === 0 && !isTimerRunning));

  return (
    <>
      {isLoading && <LoadingScreen onFinish={() => setIsLoading(false)} />}
      <div onDoubleClick={toggleFullScreen} className={`h-[100dvh] w-[100dvw] transition-all duration-300 flex flex-col justify-between overflow-hidden px-4 lg:px-20 ${mode === 'dark' ? 'bg-[#080808] text-white' : 'bg-[#f4f4f6] text-black'} ${showHaltColors ? 'bg-red-600 !text-black' : ''}`}>
        <header className="relative py-6 lg:py-14 flex items-center justify-center w-full shrink-0">
          <div className="absolute left-0">
             <div className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-center">
            <h2 className={`text-sm md:text-xl lg:text-2xl font-extrabold tracking-[0.15em] ${showHaltColors ? 'text-black' : ''}`}>
              {currentTime.getDate()} {currentTime.toLocaleString('en-US', { month: 'long' }).toUpperCase()} {currentTime.getFullYear()}
            </h2>
            <span className="opacity-20 hidden md:block">|</span>
            <h2 className={`text-sm md:text-xl lg:text-2xl font-extrabold tracking-[0.15em] ${showHaltColors ? 'text-black' : ''}`}>
              {currentTime.toLocaleString('en-US', { weekday: 'long' }).toUpperCase()}
            </h2>
          </div>
          <div className="absolute right-0">
            <button onClick={() => setView(view === 'clock' ? 'timer' : 'clock')} className="p-3 opacity-60 hover:opacity-100 transition-transform hover:scale-110 active:scale-95">
              <Hourglass className="w-5 h-5 lg:w-7 lg:h-7" />
            </button>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'clock' ? (
              <motion.div key="clock-display" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col md:flex-row items-center justify-center scale-90 sm:scale-100 gap-4 md:gap-0">
                <DigitPair value={currentTime.getHours()} isFinished={false} />
                <div className="hidden md:block"><Colon isFinished={false} /></div>
                <div className="md:hidden"><div className="flex gap-2 p-2 opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-current" /><div className="w-1.5 h-1.5 rounded-full bg-current" /></div></div>
                <DigitPair value={currentTime.getMinutes()} isFinished={false} />
                <div className="hidden md:block"><Colon isFinished={false} /></div>
                <div className="md:hidden"><div className="flex gap-2 p-2 opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-current" /><div className="w-1.5 h-1.5 rounded-full bg-current" /></div></div>
                <DigitPair value={currentTime.getSeconds()} isFinished={false} />
              </motion.div>
            ) : (
              <motion.div key="timer-display" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col items-center justify-center scale-90 sm:scale-100">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
                  <DigitPair value={Math.floor(timeLeft / 3600)} isFinished={showHaltColors} />
                  <div className="hidden md:block"><Colon isFinished={showHaltColors} /></div>
                  <DigitPair value={Math.floor((timeLeft % 3600) / 60)} isFinished={showHaltColors} />
                  <div className="hidden md:block"><Colon isFinished={showHaltColors} /></div>
                  <DigitPair value={timeLeft % 60} isFinished={showHaltColors} />
                </div>
                <div className="mt-8 lg:mt-12 flex flex-col items-center gap-6 lg:gap-8">
                  <div className="flex gap-8 lg:gap-16">
                    {(['h', 'm', 's'] as const).map((unit) => (
                      <div key={unit} className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-widest opacity-40 mb-2">{unit === 'h' ? 'Hrs' : unit === 'm' ? 'Min' : 'Sec'}</span>
                        <button
                          onMouseDown={() => !isTimerRunning && setActiveDial(unit)}
                          onTouchStart={() => !isTimerRunning && setActiveDial(unit)}
                          className={`dial-trigger w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-current flex items-center justify-center transition-all ${activeDial === unit ? 'scale-125 bg-current text-reverse' : 'opacity-60 hover:opacity-100'}`}
                        >
                          <span className="font-mono font-bold">{timerInputs[unit]}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={toggleTimer} className={`px-8 lg:px-10 py-2 lg:py-3 rounded-full font-bold uppercase tracking-widest text-[10px] lg:text-xs transition-all ${showHaltColors ? 'bg-black text-red-600' : 'bg-current text-black'}`} style={{backgroundColor: showHaltColors ? '' : 'white'}}>
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={resetTimer} className="px-8 lg:px-10 py-2 lg:py-3 rounded-full border border-current font-bold uppercase tracking-widest text-[10px] lg:text-xs opacity-70 hover:opacity-100">
                      Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {activeDial && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div ref={dialRef} className="w-64 h-64 lg:w-80 lg:h-80 rounded-full border-[1px] border-white/10 bg-white/5 backdrop-blur-md relative flex items-center justify-center">
                  {[...Array(activeDial === 'h' ? 24 : 60)].map((_, i) => (
                    (i % (activeDial === 'h' ? 2 : 5) === 0) && (
                      <div key={i} className="absolute text-[10px] font-mono opacity-40" style={{ transform: `rotate(${i * (360/(activeDial === 'h' ? 24 : 60))}deg) translateY(-110px)` }}>
                        {i}
                      </div>
                    )
                  ))}
                  <div className="w-1 h-24 lg:h-32 bg-current absolute top-1/2 left-1/2 -translate-x-1/2 origin-top rounded-full" style={{ transform: `rotate(${180 + (timerInputs[activeDial] * (360/(activeDial === 'h' ? 24 : 60)))}deg)` }} />
                  <div className="text-3xl lg:text-4xl font-bold font-display">{timerInputs[activeDial]}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <footer className="py-6 lg:py-10 flex justify-between items-center shrink-0">
          <motion.a 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.8, duration: 1 }}
            href="https://github.com/chaitanyakumar-ReDSeC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 lg:w-12 lg:h-12 block rounded-full overflow-hidden hover:scale-[1.5] transition-all duration-500 ease-in-out relative group"
            style={{ perspective: '1000px' }}
          >
            <div className="relative w-full h-full transition-transform duration-500 group-hover:rotate-y-180" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                <img src="https://github.com/chaitanyakumar-ReDSeC/assets/raw/main/general/image_assets/static/git-hub.png" alt="GitHub Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <img src="https://avatars.githubusercontent.com/u/146118747?v=4" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.a>
          <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} className="p-3 opacity-60 hover:opacity-100 transition-transform hover:scale-110 active:scale-95">
            <Lightbulb className={mode === 'light' ? 'fill-yellow-400 text-yellow-500 w-6 h-6 lg:w-8 lg:h-8' : 'w-6 h-6 lg:w-8 lg:h-8'} />
          </button>
        </footer>
      </div>
    </>
  );
}
