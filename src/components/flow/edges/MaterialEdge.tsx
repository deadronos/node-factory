import { EdgeLabelRenderer, getBezierPath, type EdgeProps } from "reactflow";
import type { MaterialEdgeData, ResourceType } from "@/game/types";

function colorFor(type: ResourceType | null) {
  if (type === "Ore") return "#b45309"; // amber-700
  if (type === "Ingots") return "#334155"; // slate-700
  if (type === "Modules") return "#047857"; // emerald-700
  return "#64748b"; // slate-500
}

export function MaterialEdge(props: EdgeProps<MaterialEdgeData>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const flow = data?.flowPerSec ?? 0;
  const throughput = data?.throughputPerSec ?? 0;
  const resourceType = data?.resourceType ?? null;
  const stroke = colorFor(resourceType);

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={flow > 0 ? "6 6" : undefined}
        className={flow > 0 ? "edge-flow" : undefined}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "none",
          }}
          className="rounded-md border bg-background/80 px-2 py-0.5 text-[11px] text-foreground shadow-sm backdrop-blur"
        >
          <span className="font-mono">
            {resourceType ?? "?"} {flow > 0 ? `${flow.toFixed(1)}/s` : "0/s"} | cap {throughput}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
