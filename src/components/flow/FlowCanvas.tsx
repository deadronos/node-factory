import ReactFlow, {
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodePalette } from './NodePalette';
import { useStore } from '../../store/useStore';
import MinerNode from '../../nodes/MinerNode';
import RefinerNode from '../../nodes/RefinerNode';
import AssemblerNode from '../../nodes/AssemblerNode';
import StorageNode from '../../nodes/StorageNode';
import { useGameLoop } from '../../hooks/useGameLoop';
import ConveyorEdge from '../../edges/ConveyorEdge';

const nodeTypes = {
  Miner: MinerNode,
  Refiner: RefinerNode,
  Assembler: AssemblerNode,
  Storage: StorageNode,
};

const edgeTypes = {
    conveyor: ConveyorEdge,
};

function FlowCanvasContent() {
    useGameLoop();
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const onNodesChange = useStore((state) => state.onNodesChange);
    const onEdgesChange = useStore((state) => state.onEdgesChange);
    const onConnect = useStore((state) => state.onConnect);
    const addNode = useStore((state) => state.addNode);

    return (
        <div style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <NodePalette addNode={(type) => addNode(type, { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 })} />
            <div style={{ flex: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                />
            </div>
        </div>
    );
}

export default function FlowCanvas() {
    return (
        <ReactFlowProvider>
            <FlowCanvasContent />
        </ReactFlowProvider>
    )
}
