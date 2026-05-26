import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b"
      style={{
        background: isDark ? 'rgba(5, 0, 0, 0.9)' : 'rgba(245, 245, 245, 0.9)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <span
            className="font-display text-sm font-bold tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            DEMS
          </span>
          <span
            className="font-mono text-xs hidden sm:inline"
            style={{ color: 'var(--text-muted)' }}
          >
            v2.0
          </span>
        </div>

        {/* Center - Clock */}
        <div
          className="font-mono text-sm tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            SYS_TIME:{' '}
          </span>
          {timeStr}
        </div>

        {/* Right - Theme Toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
