import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from 'reactflow';
import type { NodeData, EdgeData } from './types';

interface GameState {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  wallet: number; // Modules
  lifetimeModules: number;
  tick: number;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  runTick: (dt: number) => void;
}

// Initial costs (simple look up)
export const NODE_COSTS: Record<string, number> = {
  Miner: 10,
  Refiner: 20,
  Assembler: 30,
  Storage: 10,
};

export const useStore = create<GameState>((set, get) => ({
  nodes: [
      {
          id: 'miner-1',
          type: 'Miner',
          position: { x: 100, y: 200 },
          data: { label: 'Miner', type: 'Miner', inputBuffer: {}, outputBuffer: {}, productionRate: 1 }
      },
      {
          id: 'refiner-1',
          type: 'Refiner',
          position: { x: 350, y: 200 },
          data: {
              label: 'Refiner',
              type: 'Refiner',
              inputBuffer: {},
              outputBuffer: {},
              productionRate: 1,
              recipe: { input: { type: 'Ore', amount: 1 }, output: { type: 'Ingot', amount: 1 } }
          }
      },
      {
          id: 'assembler-1',
          type: 'Assembler',
          position: { x: 600, y: 200 },
          data: {
              label: 'Assembler',
              type: 'Assembler',
              inputBuffer: {},
              outputBuffer: {},
              productionRate: 1,
              recipe: { input: { type: 'Ingot', amount: 1 }, output: { type: 'Module', amount: 1 } }
          }
      },
      {
        id: 'storage-1',
        type: 'Storage',
        position: { x: 850, y: 200 },
        data: { label: 'Storage', type: 'Storage', inputBuffer: {}, outputBuffer: {}, productionRate: 0 }
    }
  ],
  edges: [],
  wallet: 50,
  lifetimeModules: 0,
  tick: 0,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const edge: Edge<EdgeData> = {
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          id: `e-${connection.source}-${connection.target}-${Date.now()}`,
          type: 'conveyor',
          animated: false, // Custom animation in component
          data: { items: [], throughput: 1, length: 100 }
      };
    set({
      edges: addEdge(edge, get().edges),
    });
  },

  addNode: (type: string, position: { x: number; y: number }) => {
      const cost = NODE_COSTS[type] || 0;
      const currentWallet = get().wallet;

      if (currentWallet >= cost) {
          const id = Date.now().toString();

          let recipe;
          if (type === 'Refiner') {
            recipe = { input: { type: 'Ore', amount: 1 }, output: { type: 'Ingot', amount: 1 } };
          } else if (type === 'Assembler') {
            recipe = { input: { type: 'Ingot', amount: 1 }, output: { type: 'Module', amount: 1 } };
          }

          const newNode: Node<NodeData> = {
            id,
            position,
            type, // 'Miner', 'Refiner', etc.
            data: {
                label: type,
                type: type as any,
                inputBuffer: {},
                outputBuffer: {},
                productionRate: 1,
                productionProgress: 0,
                recipe: recipe as any
            },
          };

          set({
              nodes: [...get().nodes, newNode],
              wallet: currentWallet - cost
          });
      }
  },

  runTick: (dt: number) => {
    set((state) => {
      let collectedModules = 0;

      // Deep copy nodes and edges to mutate safely
      const nodes = state.nodes.map(node => ({
          ...node,
          data: {
              ...node.data,
              inputBuffer: {...node.data.inputBuffer},
              outputBuffer: {...node.data.outputBuffer},
              recipe: node.data.recipe ? {
                  input: { ...node.data.recipe.input },
                  output: { ...node.data.recipe.output }
              } : undefined
          }
      }));
      const edges = state.edges.map(edge => ({
          ...edge,
          data: {
              ...edge.data,
              items: [...(edge.data?.items || [])]
          }
      }));

      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const getNode = (id: string) => nodeMap.get(id);

      // 1. Production (Nodes) & Storage Logic
      nodes.forEach(node => {
          // Special Logic: Storage converts Modules to Currency
          if (node.type === 'Storage') {
             const modules = node.data.inputBuffer['Module'] || 0;
             const modulesOut = node.data.outputBuffer['Module'] || 0;

             if (modules >= 1) {
                 const amount = Math.floor(modules);
                 node.data.inputBuffer['Module'] -= amount;
                 collectedModules += amount;
             }
             if (modulesOut >= 1) {
                 const amount = Math.floor(modulesOut);
                 node.data.outputBuffer['Module'] -= amount;
                 collectedModules += amount;
             }
          }

        if (node.type === 'Miner') {
            const produced = node.data.productionRate * (dt / 1000);
            const currentOre = node.data.outputBuffer['Ore'] || 0;
            if (currentOre < 50) {
                 node.data.outputBuffer['Ore'] = currentOre + produced;
            }
        } else if (node.data.recipe) {
             const { input, output } = node.data.recipe;
             const inputAmount = node.data.inputBuffer[input.type] || 0;
             const outputAmount = node.data.outputBuffer[output.type] || 0;

             // Check if can produce
             if (inputAmount >= input.amount && outputAmount < 50) {
                 // Working
                 const progress = (node.data.productionProgress || 0) + (node.data.productionRate * dt / 1000);

                 if (progress >= 1) {
                     // Produce
                     node.data.inputBuffer[input.type] -= input.amount;
                     node.data.outputBuffer[output.type] = outputAmount + output.amount;
                     node.data.productionProgress = 0; // Reset or carry over? Reset for simplicity or carry over: progress - 1
                 } else {
                     node.data.productionProgress = progress;
                 }
             } else {
                 // Starved or Blocked
                 // Optional: Set status for UI
                 node.data.productionProgress = 0;
             }
        }
      });

      // 2. Transport (Edges)
      edges.forEach(edge => {
            if (!edge.data) return;
            // Use fixed length or calculate from positions? Using fixed for simulation stability
            const length = edge.data.length || 100;
            const speed = 50; // pixels per second equivalent
            const moveAmt = (speed * dt / 1000) / length;
            const SPACING = 0.15; // Space between items

            // Move items
            edge.data.items.forEach(item => {
                item.progress += moveAmt;
            });

            // Sort items by progress (descending) - closest to target first
            edge.data.items.sort((a, b) => b.progress - a.progress);

            // Collision logic
            for (let i = 1; i < edge.data.items.length; i++) {
                const ahead = edge.data.items[i-1];
                const current = edge.data.items[i];
                if (current.progress > ahead.progress - SPACING) {
                    current.progress = ahead.progress - SPACING;
                }
            }

            // Target Transfer (Unload)
            if (edge.data.items.length > 0) {
                const firstItem = edge.data.items[0];
                if (firstItem.progress >= 1) {
                    firstItem.progress = 1;

                    const targetNode = getNode(edge.target);
                    if (targetNode) {
                        const currentInput = targetNode.data.inputBuffer[firstItem.type] || 0;
                        if (currentInput < 50) {
                            targetNode.data.inputBuffer[firstItem.type] = currentInput + 1;
                            edge.data.items.shift();
                        }
                    }
                }
            }

            // Source Transfer (Load)
            const lastItem = edge.data.items[edge.data.items.length - 1];
            if (!lastItem || lastItem.progress > SPACING) {
                const sourceNode = getNode(edge.source);
                if (sourceNode) {
                    for (const [res, amount] of Object.entries(sourceNode.data.outputBuffer)) {
                        if (amount >= 1) {
                            sourceNode.data.outputBuffer[res] -= 1;
                            edge.data.items.push({
                                id: Math.random().toString(36),
                                type: res as any,
                                progress: 0
                            });
                            break;
                        }
                    }
                }
            }
      });

      return {
          tick: state.tick + 1,
          nodes,
          edges,
          wallet: state.wallet + collectedModules,
          lifetimeModules: state.lifetimeModules + collectedModules
      };
    });
  }
}));
