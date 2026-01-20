import { GOAL_MODULES_TOTAL } from "@/game/config";
import { countAvailableModules } from "@/game/economy";
import { useGameStore } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function fmt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(1);
}

export function GameTopBar() {
  const isRunning = useGameStore((s) => s.isRunning);
  const toggleRunning = useGameStore((s) => s.toggleRunning);
  const initNewGame = useGameStore((s) => s.initNewGame);
  const nodes = useGameStore((s) => s.nodes);
  const producedTotal = useGameStore((s) => s.modulesProducedTotal);
  const modulesPerSec = useGameStore((s) => s.lastModulesPerSec);
  const hasWon = useGameStore((s) => s.hasWon);

  const available = countAvailableModules(nodes);
  const progress = Math.min(100, (producedTotal / GOAL_MODULES_TOTAL) * 100);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold tracking-tight">Nanobot Swarm Factory</div>
        <div className="text-xs text-muted-foreground">V1 MVP (M0–M4)</div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={toggleRunning}>
          {isRunning ? "Pause" : "Run"}
        </Button>
        <Button size="sm" variant="outline" onClick={initNewGame}>
          New Game
        </Button>
      </div>

      <div className="flex min-w-[360px] flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between text-xs">
          <div className="text-muted-foreground">
            Modules available: <span className="font-mono text-foreground">{fmt(available)}</span>
            {"  "}
            Produced: <span className="font-mono text-foreground">{fmt(producedTotal)}</span>
            {"  "}
            Rate: <span className="font-mono text-foreground">{fmt(modulesPerSec)}/s</span>
          </div>
          <div className="font-mono text-muted-foreground">
            Goal {GOAL_MODULES_TOTAL}
          </div>
        </div>
        <Progress value={progress} />
        {hasWon ? (
          <div className="text-xs font-medium text-emerald-700">
            Goal reached. Expand the line or start a new run.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Produce {GOAL_MODULES_TOTAL} Modules total.</div>
        )}
      </div>
    </div>
  );
}
