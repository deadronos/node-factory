import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useGameLoop() {
  const runTick = useStore((state) => state.runTick);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const TICK_RATE = 10; // 10 ticks per second
    const TICK_MS = 1000 / TICK_RATE;

    intervalRef.current = window.setInterval(() => {
      runTick(TICK_MS);
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runTick]);
}
