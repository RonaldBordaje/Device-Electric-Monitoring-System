import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> DEMS v2.0 — Device Electric Monitoring System', delay: 0 },
  { text: '> Initializing power monitoring subsystem...', delay: 400 },
  { text: '> Loading Meralco rate database... ₱14.3496/kWh [OK]', delay: 800 },
  { text: '> Calibrating energy sensors...', delay: 1200 },
  { text: '> Hardware detection module loaded [OK]', delay: 1600 },
  { text: '> Analytics engine ready [OK]', delay: 2000 },
  { text: '> Carbon footprint calculator online [OK]', delay: 2400 },
  { text: '> System ready. Welcome, operator.', delay: 2800 },
  { text: '', delay: 3200 },
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showContinue, setShowContinue] = useState(false);
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleLines(BOOT_LINES.length);
      setShowContinue(true);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, line.delay)
      );
    });

    timers.push(
      setTimeout(() => setShowContinue(true), 3500)
    );

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Terminal window */}
        <div className="dems-card-static overflow-hidden">
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--warning)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--success)' }} />
            <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
              dems-terminal — boot
            </span>
          </div>

          {/* Terminal content */}
          <div
            ref={containerRef}
            className="p-6 min-h-[280px] max-h-[400px] overflow-y-auto"
            style={{ background: 'var(--bg-primary)' }}
          >
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-sm mb-1"
                style={{
                  color: line.text.includes('[OK]')
                    ? 'var(--success)'
                    : line.text.includes('Welcome')
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
                }}
              >
                {line.text}
              </motion.div>
            ))}
            {visibleLines > 0 && visibleLines < BOOT_LINES.length && (
              <span className="font-mono text-sm caret-blink" style={{ color: 'var(--accent)' }}>
                &nbsp;
              </span>
            )}
          </div>
        </div>

        {/* Continue button */}
        <AnimatePresence>
          {showContinue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-8"
            >
              <button
                onClick={onComplete}
                className="dems-btn font-display text-sm tracking-widest"
              >
                ▶ INITIALIZE MONITORING
              </button>
              <p className="font-mono text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Press to begin device analysis
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
