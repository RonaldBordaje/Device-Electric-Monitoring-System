import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { QuickProfile } from '../data/hardware';

interface UsageGraphProps {
  profile: QuickProfile;
}

interface DataPoint {
  time: string;
  watts: number;
  index: number;
}

function generateInitialData(profile: QuickProfile): DataPoint[] {
  const data: DataPoint[] = [];
  const { idle, average, peak } = profile.power;

  for (let i = 0; i < 24; i++) {
    let baseWatts: number;
    if (i >= 0 && i < 6) {
      baseWatts = idle + Math.random() * (average - idle) * 0.3;
    } else if (i >= 6 && i < 9) {
      baseWatts = average * 0.6 + Math.random() * average * 0.3;
    } else if (i >= 9 && i < 17) {
      baseWatts = average + Math.random() * (peak - average) * 0.4;
    } else if (i >= 17 && i < 21) {
      baseWatts = average * 0.8 + Math.random() * average * 0.5;
    } else {
      baseWatts = average * 0.4 + Math.random() * average * 0.3;
    }

    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      watts: Math.round(baseWatts),
      index: i,
    });
  }

  return data;
}

export default function UsageGraph({ profile }: UsageGraphProps) {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();
  const [data, setData] = useState<DataPoint[]>(() => generateInitialData(profile));
  const counterRef = useRef(24);

  const addLiveReading = useCallback(() => {
    const { idle, average, peak } = profile.power;
    const range = peak - idle;
    const baseWatts = average + (Math.random() - 0.5) * range * 0.4;
    const newPoint: DataPoint = {
      time: `T+${counterRef.current - 23}`,
      watts: Math.round(Math.max(idle, Math.min(peak, baseWatts))),
      index: counterRef.current,
    };
    counterRef.current++;

    setData(prev => {
      const next = [...prev, newPoint];
      if (next.length > 30) return next.slice(-30);
      return next;
    });
  }, [profile.power]);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(addLiveReading, 5000);
    return () => clearInterval(timer);
  }, [addLiveReading, reducedMotion]);

  const accentColor = isDark ? '#FF0033' : '#CC0022';
  const gridColor = isDark ? '#220000' : '#E0C0C0';
  const textColor = isDark ? '#994444' : '#8A5555';

  return (
    <div className="dems-card-static p-4">
      <div className="flex items-center justify-between mb-4">
        <h4
          className="font-display text-xs font-bold tracking-wider"
          style={{ color: 'var(--accent)' }}
        >
          HOURLY WATTAGE
        </h4>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full pulse-dot"
            style={{ background: 'var(--success)' }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'var(--success)' }}>
            LIVE
          </span>
        </div>
      </div>

      <div className="h-[200px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="wattGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tick={{ fill: textColor, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              stroke={gridColor}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              stroke={gridColor}
              unit="W"
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#110000' : '#FFFFFF',
                border: `1px solid ${accentColor}`,
                borderRadius: '4px',
                fontFamily: 'Share Tech Mono',
                fontSize: '12px',
                color: isDark ? '#FFB3B3' : '#1A0000',
              }}
              formatter={(value: number) => [`${value}W`, 'Power Draw']}
            />
            <Area
              type="monotone"
              dataKey="watts"
              stroke={accentColor}
              fillOpacity={1}
              fill="url(#wattGradient)"
              strokeWidth={2}
              isAnimationActive={!reducedMotion}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* Monthly Cost Chart */
export function MonthlyCostChart({ profile }: { profile: QuickProfile }) {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  const MERALCO_RATE = 14.3496;
  const data = Array.from({ length: 12 }, (_, i) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const variation = 0.85 + Math.random() * 0.3;
    const avgKw = (profile.power.average * variation) / 1000;
    const monthlyCost = avgKw * 8 * 30 * MERALCO_RATE;
    return {
      month: monthNames[i],
      cost: Math.round(monthlyCost * 100) / 100,
    };
  });

  const accentColor = isDark ? '#FF0033' : '#CC0022';
  const gridColor = isDark ? '#220000' : '#E0C0C0';
  const textColor = isDark ? '#994444' : '#8A5555';

  return (
    <div className="dems-card-static p-4">
      <h4
        className="font-display text-xs font-bold tracking-wider mb-4"
        style={{ color: 'var(--accent)' }}
      >
        MONTHLY COST PROJECTION
      </h4>
      <div className="h-[200px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="month"
              tick={{ fill: textColor, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              stroke={gridColor}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              stroke={gridColor}
              tickFormatter={(v) => `₱${v}`}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#110000' : '#FFFFFF',
                border: `1px solid ${accentColor}`,
                borderRadius: '4px',
                fontFamily: 'Share Tech Mono',
                fontSize: '12px',
                color: isDark ? '#FFB3B3' : '#1A0000',
              }}
              formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Est. Cost']}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke={accentColor}
              strokeWidth={2}
              dot={{ fill: accentColor, r: 3 }}
              isAnimationActive={!reducedMotion}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
