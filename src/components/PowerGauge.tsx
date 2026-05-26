import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface PowerGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
}

export default function PowerGauge({
  value,
  max,
  label,
  unit = 'W',
  color = 'var(--accent)',
  size = 120,
}: PowerGaugeProps) {
  const reducedMotion = useReducedMotion();
  const [animatedValue, setAnimatedValue] = useState(0);

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - (animatedValue / max));

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedValue(value);
      return;
    }

    let frame: number;
    const start = animatedValue;
    const diff = value - start;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setAnimatedValue(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: reducedMotion ? 'none' : 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display"
          style={{ fill: 'var(--text-primary)', fontSize: size * 0.18, fontWeight: 700 }}
        >
          {Math.round(animatedValue)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono"
          style={{ fill: 'var(--text-muted)', fontSize: size * 0.1 }}
        >
          {unit}
        </text>
      </svg>
      <span
        className="font-display text-xs font-bold mt-2 tracking-wider text-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
        {Math.round(percentage * 100)}% of {max}W
      </span>
    </div>
  );
}
