import type { MaterialEdgeData, NodeData } from "@/game/types";
import { useGameStore } from "@/stores/gameStore";
import type { Edge, Node } from "reactflow";

function fmt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(1);
}

export function InspectorPanel() {
  const selectedNodeId = useGameStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGameStore((s) => s.selectedEdgeId);
  const nodes = useGameStore((s) => s.nodes);
  const edges = useGameStore((s) => s.edges);

  const node = (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null) as
    | Node<NodeData>
    | null;
  const edge = (selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : null) as
    | Edge<MaterialEdgeData>
    | null;

  if (!node && !edge) {
    return (
      <div>
        <div className="text-sm font-semibold">Inspect</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Click a node or belt to see stats.
        </div>
      </div>
    );
  }

  if (edge) {
    const data = edge.data;
    return (
      <div>
        <div className="text-sm font-semibold">Belt</div>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="text-muted-foreground">Resource</div>
          <div className="font-mono text-foreground">{data?.resourceType ?? "?"}</div>
          <div className="text-muted-foreground">Throughput</div>
          <div className="font-mono text-foreground">{fmt(data?.throughputPerSec ?? 0)}/s</div>
          <div className="text-muted-foreground">Flow</div>
          <div className="font-mono text-foreground">{fmt(data?.flowPerSec ?? 0)}/s</div>
        </div>
      </div>
    );
  }

  const sim = node!.data.sim;

  return (
    <div>
      <div className="text-sm font-semibold">{node!.data.title}</div>
      <div className="mt-1 text-xs text-muted-foreground">Status: {sim.status}</div>

      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        {sim.kind === "miner" ? (
          <>
            <div className="text-muted-foreground">Ore/sec</div>
            <div className="font-mono text-foreground">{fmt(sim.orePerSec)}</div>
            <div className="text-muted-foreground">Ore out</div>
            <div className="font-mono text-foreground">
              {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
            </div>
          </>
        ) : null}

        {sim.kind === "refiner" ? (
          <>
            <div className="text-muted-foreground">Rate</div>
            <div className="font-mono text-foreground">{fmt(sim.oreToIngotPerSec)}/s</div>
            <div className="text-muted-foreground">Ore in</div>
            <div className="font-mono text-foreground">
              {fmt(sim.input.amount)} / {fmt(sim.input.capacity)}
            </div>
            <div className="text-muted-foreground">Ingots out</div>
            <div className="font-mono text-foreground">
              {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
            </div>
          </>
        ) : null}

        {sim.kind === "assembler" ? (
          <>
            <div className="text-muted-foreground">Rate</div>
            <div className="font-mono text-foreground">{fmt(sim.ingotToModulePerSec)}/s</div>
            <div className="text-muted-foreground">Ingots in</div>
            <div className="font-mono text-foreground">
              {fmt(sim.input.amount)} / {fmt(sim.input.capacity)}
            </div>
            <div className="text-muted-foreground">Modules out</div>
            <div className="font-mono text-foreground">
              {fmt(sim.out.amount)} / {fmt(sim.out.capacity)}
            </div>
          </>
        ) : null}

        {sim.kind === "storage" ? (
          <>
            <div className="text-muted-foreground">Type</div>
            <div className="font-mono text-foreground">{sim.lockedType ?? "(empty)"}</div>
            <div className="text-muted-foreground">Stored</div>
            <div className="font-mono text-foreground">
              {fmt(sim.amount)} / {fmt(sim.capacity)}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
