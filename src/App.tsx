import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useReducedMotion } from './hooks/useReducedMotion';
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import BootSequence from './components/BootSequence';
import DeviceSelector from './components/DeviceSelector';
import HardwareScan, { type DetectedInfo } from './components/HardwareScan';
import ProfileSelector from './components/ProfileSelector';
import Dashboard from './components/Dashboard';
import type { QuickProfile } from './data/hardware';

type AppPhase = 'boot' | 'select-device' | 'scan' | 'select-profile' | 'dashboard';

function AppContent() {
  const [phase, setPhase] = useState<AppPhase>('boot');
  const [deviceType, setDeviceType] = useState<'laptop' | 'desktop'>('laptop');
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<QuickProfile | null>(null);
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();

  const handleBootComplete = useCallback(() => setPhase('select-device'), []);

  const handleDeviceSelect = useCallback((type: 'laptop' | 'desktop') => {
    setDeviceType(type);
    setPhase('scan');
  }, []);

  const handleScanComplete = useCallback((info: DetectedInfo) => {
    setDetectedInfo(info);
    setPhase('select-profile');
  }, []);

  const handleProfileSelect = useCallback((profile: QuickProfile) => {
    setSelectedProfile(profile);
    setPhase('dashboard');
  }, []);

  const handleBack = useCallback(() => {
    setPhase('select-profile');
  }, []);

  // Determine if scanlines should show
  const showScanlines = isDark && !reducedMotion;

  return (
    <div
      className={`min-h-screen relative ${showScanlines ? 'scanlines scanline-sweep' : ''}`}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Particle Background — always active */}
      <ParticleBackground />

      {/* Navbar — always visible */}
      <Navbar />

      {/* Main content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {phase === 'boot' && (
            <PageWrapper key="boot">
              <BootSequence onComplete={handleBootComplete} />
            </PageWrapper>
          )}

          {phase === 'select-device' && (
            <PageWrapper key="device">
              <DeviceSelector onSelect={handleDeviceSelect} />
            </PageWrapper>
          )}

          {phase === 'scan' && (
            <PageWrapper key="scan">
              <HardwareScan deviceType={deviceType} onComplete={handleScanComplete} />
            </PageWrapper>
          )}

          {phase === 'select-profile' && detectedInfo && (
            <PageWrapper key="profile">
              <ProfileSelector
                deviceType={deviceType}
                detectedInfo={detectedInfo}
                onSelect={handleProfileSelect}
              />
            </PageWrapper>
          )}

          {phase === 'dashboard' && selectedProfile && (
            <PageWrapper key="dashboard">
              <Dashboard profile={selectedProfile} onBack={handleBack} />
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
