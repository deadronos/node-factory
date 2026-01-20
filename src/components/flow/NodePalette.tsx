import { NODE_COSTS } from "@/game/config";
import { countAvailableModules } from "@/game/economy";
import type { NodeKind } from "@/game/types";
import { useGameStore } from "@/stores/gameStore";
import { Button } from "../ui/button";

function kindLabel(kind: NodeKind) {
  if (kind === "miner") return "Miner";
  if (kind === "refiner") return "Refiner";
  if (kind === "assembler") return "Assembler";
  return "Storage";
}

export function NodePalette() {
  const addNode = useGameStore((s) => s.addNode);
  const nodes = useGameStore((s) => s.nodes);
  const available = countAvailableModules(nodes);

  const kinds: NodeKind[] = ["miner", "refiner", "assembler", "storage"];

  return (
    <div>
      <div className="text-sm font-semibold">Build</div>
      <div className="mt-1 text-xs text-muted-foreground">
        Available Modules: <span className="font-mono text-foreground">{available.toFixed(1)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {kinds.map((kind) => {
          const cost = NODE_COSTS[kind];
          const disabled = available < cost;
          return (
            <Button
              key={kind}
              variant={disabled ? "outline" : "default"}
              disabled={disabled}
              className="justify-between"
              onClick={() => addNode(kind)}
            >
              <span>{kindLabel(kind)}</span>
              <span className="font-mono opacity-80">{cost}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
