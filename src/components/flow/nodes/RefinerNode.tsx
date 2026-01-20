import type { NodeProps } from "reactflow";
import type { NodeData } from "@/game/types";
import { FactoryNodeShell, fmt } from "./FactoryNodeShell";

export function RefinerNode(props: NodeProps<NodeData>) {
  const sim = props.data.sim;
  if (sim.kind !== "refiner") return null;

  return (
    <FactoryNodeShell {...props}>
      <div className="flex items-baseline justify-between">
        <span>Ore in</span>
        <span className="font-mono text-foreground">
          {fmt(sim.input.amount)} / {fmt(sim.input.capacity)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Ingots out</span>
        <span className="font-mono text-foreground">
          {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Rate</span>
        <span className="font-mono text-foreground">{fmt(sim.oreToIngotPerSec)}/s</span>
      </div>
    </FactoryNodeShell>
  );
}
