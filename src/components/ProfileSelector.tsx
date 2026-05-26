import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, ChevronRight } from 'lucide-react';
import { QUICK_PROFILES, type QuickProfile, type HardwareProfile, type PowerEstimate } from '../data/hardware';
import type { DetectedInfo } from './HardwareScan';

interface ProfileSelectorProps {
  deviceType: 'laptop' | 'desktop';
  detectedInfo: DetectedInfo;
  onSelect: (profile: QuickProfile) => void;
}

export default function ProfileSelector({ deviceType, detectedInfo, onSelect }: ProfileSelectorProps) {
  const [mode, setMode] = useState<'quick' | 'manual'>('quick');
  const [manualConfig, setManualConfig] = useState<HardwareProfile>({
    cpu: '',
    gpu: '',
    ram: 8,
    storage: '256GB SSD',
    display: deviceType === 'laptop' ? '15.6" FHD' : '24" FHD Monitor',
    peripherals: [],
  });
  const [manualPower, setManualPower] = useState<PowerEstimate>({
    idle: deviceType === 'laptop' ? 10 : 40,
    average: deviceType === 'laptop' ? 35 : 120,
    peak: deviceType === 'laptop' ? 65 : 250,
  });

  const filteredProfiles = QUICK_PROFILES.filter(p => p.type === deviceType);

  const handleManualSubmit = () => {
    const profile: QuickProfile = {
      name: 'Custom Config',
      type: deviceType,
      description: 'User-defined hardware configuration',
      hardware: manualConfig,
      power: manualPower,
    };
    onSelect(profile);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 pt-20"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Detected Info Banner */}
        <div className="dems-card-static p-4 mb-6">
          <h4
            className="font-display text-xs font-bold mb-2 tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            DETECTED HARDWARE
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            <InfoChip label="Platform" value={detectedInfo.platform} />
            <InfoChip label="CPU Cores" value={String(detectedInfo.cores)} />
            <InfoChip label="Memory" value={detectedInfo.memory} />
            <InfoChip label="Screen" value={detectedInfo.screen} />
            <InfoChip label="GPU" value={detectedInfo.gpu} />
            <InfoChip label="Network" value={detectedInfo.connection} />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-3 px-4 rounded font-display text-sm font-bold tracking-wider 
              border transition-all ${mode === 'quick' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
            style={{
              background: mode === 'quick' ? 'var(--accent)' : 'var(--bg-card)',
              color: mode === 'quick' ? '#fff' : 'var(--text-primary)',
            }}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            QUICK PROFILE
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 px-4 rounded font-display text-sm font-bold tracking-wider 
              border transition-all ${mode === 'manual' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
            style={{
              background: mode === 'manual' ? 'var(--accent)' : 'var(--bg-card)',
              color: mode === 'manual' ? '#fff' : 'var(--text-primary)',
            }}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            MANUAL CONFIG
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {filteredProfiles.map((profile) => (
                <button
                  key={profile.name}
                  onClick={() => onSelect(profile)}
                  className="dems-card p-4 text-left group cursor-pointer flex items-start gap-3"
                >
                  <Zap
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--accent)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-display text-sm font-bold tracking-wider"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.name}
                    </div>
                    <div
                      className="font-mono text-xs mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {profile.description}
                    </div>
                    <div
                      className="font-mono text-xs mt-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      ~{profile.power.average}W avg • {profile.power.peak}W peak
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent)' }}
                  />
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="dems-card-static p-6"
            >
              <h3
                className="font-display text-sm font-bold mb-4 tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                MANUAL HARDWARE CONFIGURATION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <FormField
                  label="CPU"
                  value={manualConfig.cpu}
                  onChange={(v) => setManualConfig({ ...manualConfig, cpu: v })}
                  placeholder="e.g. Intel Core i7-13700K"
                />
                <FormField
                  label="GPU"
                  value={manualConfig.gpu}
                  onChange={(v) => setManualConfig({ ...manualConfig, gpu: v })}
                  placeholder="e.g. RTX 4070"
                />
                <div>
                  <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    RAM (GB)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={256}
                    value={manualConfig.ram}
                    onChange={(e) => setManualConfig({ ...manualConfig, ram: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border font-mono text-sm"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <FormField
                  label="Storage"
                  value={manualConfig.storage}
                  onChange={(v) => setManualConfig({ ...manualConfig, storage: v })}
                  placeholder="e.g. 1TB NVMe SSD"
                />
              </div>

              <h4
                className="font-display text-xs font-bold mb-3 tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                POWER ESTIMATES (WATTS)
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Idle
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={manualPower.idle}
                    onChange={(e) => setManualPower({ ...manualPower, idle: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border font-mono text-sm"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Average
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={manualPower.average}
                    onChange={(e) => setManualPower({ ...manualPower, average: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border font-mono text-sm"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Peak
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={1500}
                    value={manualPower.peak}
                    onChange={(e) => setManualPower({ ...manualPower, peak: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border font-mono text-sm"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <button onClick={handleManualSubmit} className="dems-btn w-full">
                ▶ ANALYZE POWER CONSUMPTION
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="truncate" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="font-mono text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded border font-mono text-sm placeholder:opacity-40"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}
