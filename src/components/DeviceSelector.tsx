import { motion } from 'framer-motion';
import { Monitor, Laptop } from 'lucide-react';

interface DeviceSelectorProps {
  onSelect: (type: 'laptop' | 'desktop') => void;
}

export default function DeviceSelector({ onSelect }: DeviceSelectorProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center"
      >
        <h2
          className="font-display text-2xl font-bold mb-2 tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          SELECT DEVICE TYPE
        </h2>
        <p className="font-mono text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Choose your hardware category for accurate power analysis
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('laptop')}
            className="dems-card p-8 flex flex-col items-center gap-4 cursor-pointer 
              group focus:outline-none focus-visible:ring-2"
            style={{
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
          >
            <Laptop
              className="w-16 h-16 transition-transform group-hover:scale-110"
              style={{ color: 'var(--accent)' }}
            />
            <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              LAPTOP
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              8W – 200W typical
            </span>
          </button>

          <button
            onClick={() => onSelect('desktop')}
            className="dems-card p-8 flex flex-col items-center gap-4 cursor-pointer 
              group focus:outline-none focus-visible:ring-2"
            style={{
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
          >
            <Monitor
              className="w-16 h-16 transition-transform group-hover:scale-110"
              style={{ color: 'var(--accent)' }}
            />
            <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              DESKTOP
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              35W – 650W typical
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
