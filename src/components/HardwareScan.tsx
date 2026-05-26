import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MonitorSmartphone, Wifi, Shield, Zap } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface HardwareScanProps {
  deviceType: 'laptop' | 'desktop';
  onComplete: (detectedInfo: DetectedInfo) => void;
}

export interface DetectedInfo {
  platform: string;
  cores: number;
  memory: string;
  screen: string;
  gpu: string;
  connection: string;
  userAgent: string;
}

const SCAN_STEPS = [
  { icon: Cpu, label: 'Scanning CPU architecture...', key: 'cpu' },
  { icon: MonitorSmartphone, label: 'Detecting display configuration...', key: 'display' },
  { icon: HardDrive, label: 'Analyzing storage subsystem...', key: 'storage' },
  { icon: Shield, label: 'Checking GPU capabilities...', key: 'gpu' },
  { icon: Wifi, label: 'Probing network interface...', key: 'network' },
  { icon: Zap, label: 'Estimating power baseline...', key: 'power' },
];

export default function HardwareScan({ deviceType, onComplete }: HardwareScanProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Skip animation, go straight to results
      const info = detectHardware();
      onComplete(info);
      return;
    }

    const stepDuration = 600;
    const totalSteps = SCAN_STEPS.length;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const target = ((currentStep + 1) / totalSteps) * 100;
        if (prev < target) return Math.min(prev + 2, target);
        return prev;
      });
    }, 30);

    const stepTimer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          const info = detectHardware();
          onComplete(info);
        }, 500);
      }
    }, stepDuration);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [currentStep, onComplete, reducedMotion]);

  // Suppress the lint error for deviceType since we use it conceptually
  void deviceType;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="dems-card-static p-6"
        >
          <h3
            className="font-display text-lg font-bold mb-6 text-center tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            HARDWARE SCAN IN PROGRESS
          </h3>

          {/* Progress bar */}
          <div
            className="w-full h-2 rounded-full mb-6 overflow-hidden"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <motion.div
              className="h-full rounded-full progress-bar-animated"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Scan steps */}
          <div className="space-y-3">
            {SCAN_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < currentStep;
              const isCurrent = i === currentStep;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: i <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-3 font-mono text-sm"
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      color: isDone
                        ? 'var(--success)'
                        : isCurrent
                        ? 'var(--accent)'
                        : 'var(--text-muted)',
                    }}
                  />
                  <span
                    style={{
                      color: isDone
                        ? 'var(--success)'
                        : isCurrent
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {isDone ? step.label.replace('...', ' [DONE]') : step.label}
                  </span>
                  {isCurrent && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ color: 'var(--accent)' }}
                    >
                      ●
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {Math.round(progress)}% complete
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function detectHardware(): DetectedInfo {
  const nav = navigator as unknown as Record<string, unknown>;
  const cores = (nav.hardwareConcurrency as number) || 4;
  const memory = nav.deviceMemory as number | undefined;
  const platform = (nav.platform as string) || 'Unknown';
  const userAgent = (nav.userAgent as string) || '';

  let gpu = 'Unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Unknown';
      }
    }
  } catch {
    gpu = 'Detection blocked';
  }

  const screen = `${window.screen.width}x${window.screen.height}`;
  const conn = nav.connection as Record<string, unknown> | undefined;
  const connection = conn ? `${conn.effectiveType || 'unknown'}` : 'Unknown';

  return {
    platform,
    cores,
    memory: memory ? `${memory}GB` : 'Not disclosed',
    screen,
    gpu: gpu.length > 50 ? gpu.substring(0, 50) + '...' : gpu,
    connection,
    userAgent: userAgent.length > 80 ? userAgent.substring(0, 80) + '...' : userAgent,
  };
}
