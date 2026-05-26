import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion, useLowEndDevice } from '../hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();

  const createParticle = useCallback((w: number, h: number): Particle => ({
    x: Math.random() * w,
    y: h + Math.random() * 20,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.5 + 0.2),
    size: Math.random() * 2 + 0.5,
    opacity: 0,
    life: 0,
    maxLife: Math.random() * 400 + 200,
  }), []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxParticles = isLowEnd ? 15 : 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: maxParticles }, () =>
      createParticle(canvas.width, canvas.height)
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.opacity = lifeRatio * 10 * 0.6;
        } else if (lifeRatio > 0.9) {
          p.opacity = (1 - lifeRatio) * 10 * 0.6;
        }

        // Reset if dead or off screen
        if (p.life >= p.maxLife || p.y < -10) {
          particlesRef.current[i] = createParticle(canvas.width, canvas.height);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 0, 51, ${p.opacity})`
          : `rgba(204, 0, 34, ${p.opacity * 0.5})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark, reducedMotion, isLowEnd, createParticle]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
