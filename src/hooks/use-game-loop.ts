import { useEffect, useRef } from "react";
import { TICK_DT } from "@/game/config";
import { useGameStore } from "@/stores/gameStore";

export function useGameLoop() {
  const isRunning = useGameStore((s) => s.isRunning);
  const tick = useGameStore((s) => s.tick);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!isRunning) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      acc += dt;

      // Fixed-step simulation for determinism.
      while (acc >= TICK_DT) {
        tickRef.current(TICK_DT);
        acc -= TICK_DT;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);
}
