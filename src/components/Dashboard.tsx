import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  DollarSign,
  Leaf,
  Award,
  Layers,
  Lightbulb,
  BarChart3,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import PowerGauge from './PowerGauge';
import UsageGraph, { MonthlyCostChart } from './UsageGraph';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  calculateCosts,
  getEfficiencyGrade,
  getCarbonFootprint,
  getComponentBreakdown,
  getRecommendations,
  MERALCO_RATE,
  type QuickProfile,
} from '../data/hardware';

interface DashboardProps {
  profile: QuickProfile;
  onBack: () => void;
}

export default function Dashboard({ profile, onBack }: DashboardProps) {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  // Session uptime
  const startTimeRef = useRef(Date.now());
  const [uptime, setUptime] = useState('00:00:00');

  // Live power draw ticker
  const [liveWatts, setLiveWatts] = useState(profile.power.average);
  const liveWattsRef = useRef(profile.power.average);

  // Uptime counter
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live wattage fluctuation
  const fluctuateWatts = useCallback(() => {
    const fluctuation = (Math.random() - 0.5) * 16; // ±8W
    const newVal = Math.round(
      Math.max(
        profile.power.idle,
        Math.min(profile.power.peak, liveWattsRef.current + fluctuation)
      )
    );
    liveWattsRef.current = newVal;
    setLiveWatts(newVal);
  }, [profile.power]);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(fluctuateWatts, 2500);
    return () => clearInterval(timer);
  }, [fluctuateWatts, reducedMotion]);

  const costs = calculateCosts(profile.power.average);
  const efficiency = getEfficiencyGrade(profile.power.average, profile.type);
  const carbon = getCarbonFootprint(profile.power.average);
  const components = getComponentBreakdown(profile);
  const recommendations = getRecommendations(profile);

  const maxGaugeWatts = profile.type === 'laptop' ? 250 : 800;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded border transition-all hover:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2
                className="font-display text-lg sm:text-xl font-bold tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                {profile.name.toUpperCase()}
              </h2>
              <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {profile.hardware.cpu} • {profile.hardware.gpu}
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Monitoring Status */}
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full pulse-dot"
                style={{ background: 'var(--success)' }}
              />
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--success)' }}>
                MONITORING ACTIVE
              </span>
            </div>

            {/* Session Uptime */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                {uptime}
              </span>
            </div>

            {/* Live Power Draw */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded border"
              style={{
                borderColor: 'var(--accent)',
                background: isDark ? 'rgba(255,0,51,0.05)' : 'rgba(204,0,34,0.05)',
              }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span
                className="font-display text-sm font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {liveWatts}W
              </span>
            </div>
          </div>
        </motion.div>

        {/* Power Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionTitle icon={Activity} title="POWER DRAW" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="dems-card-static p-4 flex justify-center">
              <PowerGauge
                value={profile.power.idle}
                max={maxGaugeWatts}
                label="IDLE"
                color="var(--success)"
              />
            </div>
            <div className="dems-card-static p-4 flex justify-center">
              <PowerGauge
                value={liveWatts}
                max={maxGaugeWatts}
                label="CURRENT"
                color="var(--accent)"
              />
            </div>
            <div className="dems-card-static p-4 flex justify-center">
              <PowerGauge
                value={profile.power.peak}
                max={maxGaugeWatts}
                label="PEAK"
                color="var(--warning)"
              />
            </div>
          </div>
        </motion.div>

        {/* Meralco Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionTitle icon={DollarSign} title="MERALCO COST BREAKDOWN" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <CostCard label="PER HOUR" value={costs.hourly} />
            <CostCard label="DAILY (8h)" value={costs.daily} />
            <CostCard label="MONTHLY" value={costs.monthly} highlight />
            <CostCard label="YEARLY" value={costs.yearly} />
          </div>
          <div className="dems-card-static p-3 mb-8">
            <p className="font-mono text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Based on Meralco rate: ₱{MERALCO_RATE}/kWh • Average usage: {profile.power.average}W •
              8 hours/day typical usage
            </p>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionTitle icon={BarChart3} title="USAGE ANALYTICS" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <UsageGraph profile={profile} />
            <MonthlyCostChart profile={profile} />
          </div>
        </motion.div>

        {/* Efficiency Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionTitle icon={Award} title="EFFICIENCY RATING" />
          <div className="dems-card-static p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-full border-4 flex items-center justify-center font-display text-4xl font-black"
                  style={{
                    borderColor: efficiency.color,
                    color: efficiency.color,
                    boxShadow: isDark ? `0 0 20px ${efficiency.color}40` : 'none',
                  }}
                >
                  {efficiency.grade}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Efficiency Score: {efficiency.score}/100
                </div>
                <div className="font-mono text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {efficiency.grade === 'S' && 'Outstanding! This setup is extremely power-efficient.'}
                  {efficiency.grade === 'A' && 'Excellent efficiency. Well-optimized for energy savings.'}
                  {efficiency.grade === 'B' && 'Good efficiency. Some room for improvement.'}
                  {efficiency.grade === 'C' && 'Average efficiency. Consider optimizing power settings.'}
                  {efficiency.grade === 'D' && 'Below average. Significant energy savings possible.'}
                  {efficiency.grade === 'F' && 'Poor efficiency. Major optimizations recommended.'}
                </div>
                {/* Score bar */}
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${efficiency.score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: efficiency.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Component Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionTitle icon={Layers} title="COMPONENT BREAKDOWN" />
          <div className="dems-card-static p-4 mb-8">
            <div className="space-y-3">
              {components.map((comp) => (
                <div key={comp.component} className="flex items-center gap-3">
                  <span
                    className="font-mono text-xs w-36 sm:w-44 truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {comp.component}
                  </span>
                  <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${comp.percentage}%`,
                        background: `linear-gradient(90deg, var(--accent-dim), var(--accent))`,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-xs w-16 text-right"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {comp.watts}W ({comp.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Carbon Footprint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionTitle icon={Leaf} title="CARBON FOOTPRINT" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="dems-card-static p-4 text-center">
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                DAILY CO₂
              </div>
              <div className="font-display text-xl font-bold" style={{ color: 'var(--success)' }}>
                {carbon.daily.toFixed(2)}
              </div>
              <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>kg CO₂</div>
            </div>
            <div className="dems-card-static p-4 text-center">
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                MONTHLY CO₂
              </div>
              <div className="font-display text-xl font-bold" style={{ color: 'var(--warning)' }}>
                {carbon.monthly.toFixed(1)}
              </div>
              <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>kg CO₂</div>
            </div>
            <div className="dems-card-static p-4 text-center">
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                YEARLY CO₂
              </div>
              <div className="font-display text-xl font-bold" style={{ color: 'var(--accent)' }}>
                {carbon.yearly.toFixed(1)}
              </div>
              <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>kg CO₂</div>
            </div>
          </div>
          <div className="dems-card-static p-3 mb-8">
            <p className="font-mono text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Based on Philippines grid emission factor: 0.68 kg CO₂/kWh • 8 hours daily usage
            </p>
          </div>
        </motion.div>

        {/* Device Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SectionTitle icon={BarChart3} title="DEVICE COMPARISON" />
          <div className="dems-card-static p-4 mb-8 overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-2 pr-4">Device</th>
                  <th className="text-right py-2 px-2">Avg W</th>
                  <th className="text-right py-2 px-2">Monthly ₱</th>
                  <th className="text-right py-2 px-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'LED Bulb', watts: 10 },
                  { name: 'Laptop (Office)', watts: 25 },
                  { name: profile.name, watts: profile.power.average },
                  { name: 'Desktop (Gaming)', watts: 350 },
                  { name: 'Air Conditioner', watts: 1500 },
                  { name: 'Electric Oven', watts: 2000 },
                ].map((device) => {
                  const c = calculateCosts(device.watts);
                  const isActive = device.name === profile.name;
                  return (
                    <tr
                      key={device.name}
                      className="border-t"
                      style={{
                        borderColor: 'var(--border)',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      <td className="py-2 pr-4">
                        {isActive ? '▸ ' : '  '}
                        {device.name}
                      </td>
                      <td className="text-right py-2 px-2">{device.watts}W</td>
                      <td className="text-right py-2 px-2">₱{c.monthly.toFixed(0)}</td>
                      <td className="text-right py-2 px-2">
                        {device.watts <= 30 ? '★★★' : device.watts <= 100 ? '★★' : device.watts <= 300 ? '★' : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Energy Saving Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <SectionTitle icon={Lightbulb} title="ENERGY SAVING RECOMMENDATIONS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {recommendations.map((rec, i) => (
              <div key={i} className="dems-card-static p-4 flex gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-display text-xs font-bold"
                  style={{
                    background: isDark ? 'rgba(255,0,51,0.15)' : 'rgba(204,0,34,0.1)',
                    color: 'var(--accent)',
                  }}
                >
                  {i + 1}
                </div>
                <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="font-display text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
            DEMS v2.0 — Device Electric Monitoring System
          </p>
          <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Data is simulated for demonstration purposes. Actual power consumption may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
      <h3
        className="font-display text-sm font-bold tracking-wider"
        style={{ color: 'var(--accent)' }}
      >
        {title}
      </h3>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

function CostCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className="dems-card-static p-4 text-center"
      style={highlight ? { borderColor: 'var(--accent)' } : {}}
    >
      <div className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="font-display text-xl font-bold"
        style={{ color: highlight ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        ₱{value < 1 ? value.toFixed(4) : value < 100 ? value.toFixed(2) : value.toFixed(0)}
      </div>
    </div>
  );
}
