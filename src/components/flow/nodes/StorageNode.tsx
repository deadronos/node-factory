import type { NodeProps } from "reactflow";
import type { NodeData } from "@/game/types";
import { FactoryNodeShell, fmt } from "./FactoryNodeShell";

export function StorageNode(props: NodeProps<NodeData>) {
  const sim = props.data.sim;
  if (sim.kind !== "storage") return null;

  const label = sim.lockedType ?? "(empty)";

  return (
    <FactoryNodeShell {...props}>
      <div className="flex items-baseline justify-between">
        <span>Type</span>
        <span className="font-mono text-foreground">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Stored</span>
        <span className="font-mono text-foreground">
          {fmt(sim.amount)} / {fmt(sim.capacity)}
        </span>
      </div>
    </FactoryNodeShell>
  );
}
