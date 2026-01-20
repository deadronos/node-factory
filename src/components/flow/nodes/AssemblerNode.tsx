import type { NodeProps } from "reactflow";
import type { NodeData } from "@/game/types";
import { FactoryNodeShell, fmt } from "./FactoryNodeShell";

export function AssemblerNode(props: NodeProps<NodeData>) {
  const sim = props.data.sim;
  if (sim.kind !== "assembler") return null;

  return (
    <FactoryNodeShell {...props}>
      <div className="flex items-baseline justify-between">
        <span>Ingots in</span>
        <span className="font-mono text-foreground">
          {fmt(sim.input.amount)} / {fmt(sim.input.capacity)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Modules out</span>
        <span className="font-mono text-foreground">
          {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span>Rate</span>
        <span className="font-mono text-foreground">{fmt(sim.ingotToModulePerSec)}/s</span>
      </div>
    </FactoryNodeShell>
  );
}
