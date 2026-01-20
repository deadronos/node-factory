import { useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, type OnSelectionChangeParams } from "reactflow";
import "reactflow/dist/style.css";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useGameStore } from "@/stores/gameStore";
import { NodePalette } from "./NodePalette";
import { MinerNode } from "./nodes/MinerNode";
import { RefinerNode } from "./nodes/RefinerNode";
import { AssemblerNode } from "./nodes/AssemblerNode";
import { StorageNode } from "./nodes/StorageNode";
import { MaterialEdge } from "./edges/MaterialEdge";
import { InspectorPanel } from "../game/InspectorPanel";

export default function FlowCanvas() {
  const nodes = useGameStore((s) => s.nodes);
  const edges = useGameStore((s) => s.edges);
  const onNodesChange = useGameStore((s) => s.onNodesChange);
  const onEdgesChange = useGameStore((s) => s.onEdgesChange);
  const onConnect = useGameStore((s) => s.onConnect);
  const initNewGame = useGameStore((s) => s.initNewGame);
  const setSelection = useGameStore((s) => s.setSelection);

  useGameLoop();

  useEffect(() => {
    if (nodes.length === 0) initNewGame();
  }, [initNewGame, nodes.length]);

  const nodeTypes = useMemo(
    () => ({
      miner: MinerNode,
      refiner: RefinerNode,
      assembler: AssemblerNode,
      storage: StorageNode,
    }),
    [],
  );
  const edgeTypes = useMemo(() => ({ material: MaterialEdge }), []);

  const onSelectionChange = (sel: OnSelectionChangeParams) => {
    const nodeId = sel.nodes?.[0]?.id ?? null;
    const edgeId = sel.edges?.[0]?.id ?? null;
    setSelection({ nodeId, edgeId });
  };

  return (
    <div className="flex h-full min-h-0 w-full gap-3">
      <div className="w-[320px] shrink-0">
        <div className="h-full rounded-xl border bg-card/60 p-3">
          <NodePalette />
          <div className="mt-3 border-t pt-3">
            <InspectorPanel />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          deleteKeyCode={["Backspace", "Delete"] as any}
          fitView
        >
          <Background gap={18} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
