import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import type { Edge, Node, EdgeMouseHandler, OnConnect } from 'reactflow';
import type { NodeChange, EdgeChange, EdgeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodePalette } from './NodePaletteContainer';
import { ResearchPanel } from './ResearchPanelContainer';
import { EdgeUpgradePanel } from './EdgeUpgradePanelContainer';
import { MinerNode, RefinerNode, AssemblerNode, StorageNode, SplitterNode } from '../nodes';
import type { FactoryNodeData, BeltData, NodeType } from '../../types/game';

interface FlowCanvasProps {
    nodes: Node<FactoryNodeData>[];
    edges: Edge<BeltData>[];
    selectedEdge: Edge<BeltData> | null;
    economy: { modules: number; modulesPerSecond: number; totalModulesProduced: number };
    goals: { target: number; current: number; type: string; completed: boolean }[];
    isPaused: boolean;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: any) => void;
    onEdgeClick: EdgeMouseHandler;
    onAddNode: (type: NodeType) => void;
    onTogglePause: () => void;
    onCloseSelectedEdge: () => void;
}

export default function FlowCanvasPresentational({
    nodes,
    edges,
    selectedEdge,
    economy,
    goals,
    isPaused,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeClick,
    onAddNode,
    onTogglePause,
    onCloseSelectedEdge,
}: FlowCanvasProps) {
    // Define custom node types
    const nodeTypes = useMemo(
        () => ({
            miner: MinerNode,
            refiner: RefinerNode,
            assembler: AssemblerNode,
            storage: StorageNode,
            splitter: SplitterNode,
        }),
        []
    );

    return (
        <div style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
                <NodePalette addNode={onAddNode} />
                <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold">
                        💚 Modules: {economy.modules.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600">
                        📈 {economy.modulesPerSecond.toFixed(2)}/s
                    </div>
                    <div className="text-sm text-slate-600">
                        Total: {economy.totalModulesProduced.toFixed(1)}
                    </div>
                    <button
                        onClick={onTogglePause}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        {isPaused ? '▶ Run' : '⏸ Pause'}
                    </button>
                </div>
            </div>
            {goals.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 border-b">
                    <div className="text-sm font-semibold mb-1">Goal: Produce {goals[0].target} Modules</div>
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min((goals[0].current / goals[0].target) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                        {goals[0].current.toFixed(1)} / {goals[0].target}
                        {goals[0].completed && ' ✅ Complete!'}
                    </div>
                </div>
            )}
            <div className="flex-1 flex gap-4 p-4">
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onEdgeClick={onEdgeClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                    <EdgeUpgradePanel
                        selectedEdge={selectedEdge}
                        onClose={onCloseSelectedEdge}
                    />
                </div>
                <div className="w-80 space-y-4">
                    <ResearchPanel />
                </div>
            </div>
        </div>
    );
}