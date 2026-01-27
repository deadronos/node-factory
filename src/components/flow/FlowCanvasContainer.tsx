import { useCallback, useEffect, useState } from 'react';
import type { Connection, Edge, Node, OnConnect } from 'reactflow';
import type { NodeChange, EdgeChange, EdgeMouseHandler } from 'reactflow';
import { useGameStore } from '../../store/gameStore';
import { createFactoryNode } from '../../engine/nodeFactory';
import { simulateTick } from '../../engine/simulation';
import type { FactoryNodeData, BeltData, NodeType } from '../../types/game';
import { BASE_BELT_THROUGHPUT } from '../../types/game';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import FlowCanvasPresentational from './FlowCanvasPresentational';

function FlowCanvas() {
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
                animated: true, // Add animation to show material flow
                style: {
                    strokeWidth: 2,
                },
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

    const handleCloseSelectedEdge = useCallback(() => {
        setSelectedEdge(null);
    }, []);

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
        <FlowCanvasPresentational
            nodes={nodes}
            edges={edges}
            selectedEdge={selectedEdge}
            economy={economy}
            goals={goals}
            isPaused={isPaused}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onAddNode={addNode}
            onTogglePause={togglePause}
            onCloseSelectedEdge={handleCloseSelectedEdge}
        />
    );
}

export default FlowCanvasContainer;