import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const nav = navigator as unknown as Record<string, unknown>;
    const cores = (nav.hardwareConcurrency as number) || 4;
    const memory = nav.deviceMemory as number | undefined;
    
    if (cores <= 2 || (memory !== undefined && memory <= 2)) {
      setIsLowEnd(true);
    }
  }, []);

  return isLowEnd;
}
