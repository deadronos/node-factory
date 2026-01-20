import type { NodeProps } from "reactflow";
import type { NodeData } from "@/game/types";
import { FactoryNodeShell, fmt } from "./FactoryNodeShell";

export function MinerNode(props: NodeProps<NodeData>) {
  const sim = props.data.sim;
  if (sim.kind !== "miner") return null;

  return (
    <FactoryNodeShell {...props} hasInput={false}>
      <div className="flex items-baseline justify-between">
        <span>Ore buffer</span>
        <span className="font-mono text-foreground">
          {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Rate</span>
        <span className="font-mono text-foreground">{fmt(sim.orePerSec)}/s</span>
      </div>
    </FactoryNodeShell>
  );
}
