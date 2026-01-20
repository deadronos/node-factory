import React, { useCallback, useState } from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
} from 'reactflow';
import type { Connection,
              Edge,
              Node,
              OnConnect
 } from 'reactflow';
import type { NodeChange, EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodePalette } from './NodePalette';

export default function FlowCanvas() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((n) => applyNodeChanges(changes, n)),
        []
    );
    
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((e) => applyEdgeChanges(changes, e)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (connection: Connection) => setEdges((e) => addEdge(connection, e)),
        []
    );

    const addNode = useCallback((type: string) => {
        const id = Date.now().toString();
        const newNode: Node = {
            id,
            // quick center on screen — good enough for M0
            position: { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 50 },
            data: { label: type },
        };
        setNodes((ns) => ns.concat(newNode));
    }, []);

    return (
        <div style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <NodePalette addNode={addNode} />
            <div style={{ flex: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                />
            </div>
        </div>
    );
}