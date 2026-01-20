import type { ReactNode } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { NodeData, NodeStatus } from "@/game/types";

function statusClass(status: NodeStatus) {
  switch (status) {
    case "Running":
      return "bg-emerald-500/15 text-emerald-800 border-emerald-500/30";
    case "Starved":
      return "bg-amber-500/15 text-amber-800 border-amber-500/30";
    case "Blocked":
      return "bg-rose-500/15 text-rose-800 border-rose-500/30";
  }
}

export function fmt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(1);
}

export function FactoryNodeShell({
  data,
  selected,
  children,
  hasInput = true,
  hasOutput = true,
}: NodeProps<NodeData> & {
  children: ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
}) {
  return (
    <div
      className={[
        "w-[220px] rounded-xl border bg-card/95 shadow-sm backdrop-blur-sm",
        selected ? "ring-2 ring-ring/60" : "ring-0",
      ].join(" ")}
    >
      {hasInput ? (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-background !bg-primary"
        />
      ) : null}
      {hasOutput ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-background !bg-primary"
        />
      ) : null}

      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="text-sm font-semibold tracking-tight">{data.title}</div>
        <div
          className={
            "rounded-md border px-2 py-0.5 text-[11px] font-medium " +
            statusClass(data.sim.status)
          }
        >
          {data.sim.status}
        </div>
      </div>

      <div className="px-3 py-2 text-xs text-muted-foreground">{children}</div>
    </div>
  );
}
