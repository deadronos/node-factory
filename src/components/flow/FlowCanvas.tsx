import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import type { Connection,
              Edge,
              Node,
              OnConnect
 } from 'reactflow';
import type { NodeChange, EdgeChange, EdgeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodePalette } from './NodePalette';
import { ResearchPanel } from './ResearchPanel';
import { EdgeUpgradePanel } from './EdgeUpgradePanel';
import { useGameStore } from '../../store/gameStore';
import { MinerNode, RefinerNode, AssemblerNode, StorageNode, SplitterNode } from '../nodes';
import { createFactoryNode } from '../../engine/nodeFactory';
import { simulateTick } from '../../engine/simulation';
import type { FactoryNodeData, BeltData, NodeType } from '../../types/game';
import { BASE_BELT_THROUGHPUT } from '../../types/game';

export default function FlowCanvas() {
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        economy,
        updateEconomy,
        updateGoal,
        goals,
        isPaused,
        togglePause,
    } = useGameStore();

    const [selectedEdge, setSelectedEdge] = useState<Edge<BeltData> | null>(null);

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

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const newNodes = applyNodeChanges(changes, nodes) as Node<FactoryNodeData>[];
            setNodes(newNodes);
        },
        [nodes, setNodes]
    );
    
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            const newEdges = applyEdgeChanges(changes, edges) as Edge<BeltData>[];
            setEdges(newEdges);
            
            // Clear selected edge if it was deleted
            if (selectedEdge && !newEdges.find(e => e.id === selectedEdge.id)) {
                setSelectedEdge(null);
            }
        },
        [edges, setEdges, selectedEdge]
    );

    const onConnect: OnConnect = useCallback(
        (connection: Connection) => {
            const newEdge: Edge<BeltData> = {
                ...connection,
                id: `${connection.source}-${connection.target}-${Date.now()}`,
                data: {
                    resourceType: null,
                    throughput: BASE_BELT_THROUGHPUT,
                    level: 1,
                    flowRate: 0,
                },
            } as Edge<BeltData>;
            setEdges(addEdge(newEdge, edges));
        },
        [edges, setEdges]
    );

    const onEdgeClick: EdgeMouseHandler = useCallback(
        (_event, edge) => {
            setSelectedEdge(edge as Edge<BeltData>);
        },
        []
    );

    const addNode = useCallback((type: NodeType) => {
        const position = {
            x: Math.random() * 500 + 100,
            y: Math.random() * 300 + 100,
        };
        const newNode = createFactoryNode(type, position);
        setNodes([...nodes, newNode]);
    }, [nodes, setNodes]);

    // Simulation loop
    useEffect(() => {
        if (isPaused) return;
        
        const interval = setInterval(() => {
            const deltaTime = 0.1; // 10 ticks per second
            
            const { nodeUpdates, edgeUpdates, modulesProduced } = simulateTick(
                nodes,
                edges,
                deltaTime
            );
            
            // Apply node updates
            if (nodeUpdates.size > 0) {
                const updatedNodes = nodes.map(node => {
                    const update = nodeUpdates.get(node.id);
                    if (update) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                ...update,
                            } as FactoryNodeData,
                        };
                    }
                    return node;
                }) as Node<FactoryNodeData>[];
                setNodes(updatedNodes);
            }
            
            // Apply edge updates
            if (edgeUpdates.size > 0) {
                const updatedEdges = edges.map(edge => {
                    const update = edgeUpdates.get(edge.id);
                    if (update) {
                        return {
                            ...edge,
                            data: {
                                ...edge.data,
                                ...update,
                            } as BeltData,
                        };
                    }
                    return edge;
                });
                setEdges(updatedEdges);
            }
            
            // Update economy
            if (modulesProduced > 0) {
                const newModules = economy.modules + modulesProduced;
                const newTotal = economy.totalModulesProduced + modulesProduced;
                updateEconomy(newModules, modulesProduced / deltaTime);
                
                // Update goals
                goals.forEach((goal, index) => {
                    if (goal.type === 'total' && !goal.completed) {
                        updateGoal(index, newTotal);
                    }
                });
            }
        }, 100); // 100ms = 10 ticks per second
        
        return () => clearInterval(interval);
    }, [nodes, edges, isPaused, economy, goals, setNodes, setEdges, updateEconomy, updateGoal]);

    return (
        <div style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
                <NodePalette addNode={addNode} />
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
                        onClick={togglePause}
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
                        onClose={() => setSelectedEdge(null)}
                    />
                </div>
                <div className="w-80 space-y-4">
                    <ResearchPanel />
                </div>
            </div>
        </div>
    );
}