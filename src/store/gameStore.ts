import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import type {
  GameState,
  FactoryNodeData,
  BeltData,
  NodeType,
  Goal,
} from '../types/game';

interface GameStore extends GameState {
  // React Flow state
  nodes: Node<FactoryNodeData>[];
  edges: Edge<BeltData>[];
  
  // Actions for managing nodes
  setNodes: (nodes: Node<FactoryNodeData>[]) => void;
  setEdges: (edges: Edge<BeltData>[]) => void;
  addNode: (node: Node<FactoryNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<FactoryNodeData>) => void;
  removeNode: (nodeId: string) => void;
  
  // Actions for managing edges
  addEdge: (edge: Edge<BeltData>) => void;
  updateEdgeData: (edgeId: string, data: Partial<BeltData>) => void;
  removeEdge: (edgeId: string) => void;
  
  // Game state actions
  togglePause: () => void;
  updateEconomy: (modules: number, modulesPerSecond: number) => void;
  spendModules: (amount: number) => boolean;
  unlockNode: (nodeType: NodeType) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (index: number, current: number) => void;
  
  // Simulation
  tick: () => void;
}

const initialState: Omit<GameStore, keyof Omit<GameStore, keyof GameState | 'nodes' | 'edges'>> = {
  nodes: [],
  edges: [],
  economy: {
    modules: 0,
    totalModulesProduced: 0,
    modulesPerSecond: 0,
  },
  research: {
    unlockedNodes: new Set<NodeType>(['miner', 'refiner', 'assembler', 'storage']),
    unlockedUpgrades: new Set<string>(),
  },
  goals: [
    {
      type: 'total',
      target: 50,
      current: 0,
      completed: false,
    },
  ],
  isPaused: false,
  tickRate: 10, // 10 ticks per second
  lastTick: Date.now(),
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  
  // Node management
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),
  
  updateNodeData: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } as FactoryNodeData }
        : node
    ),
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
  })),
  
  // Edge management
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
  })),
  
  updateEdgeData: (edgeId, data) => set((state) => ({
    edges: state.edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            data: {
              ...edge.data,
              ...data,
            } as BeltData,
          }
        : edge
    ),
  })),
  
  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
  })),
  
  // Game state actions
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  updateEconomy: (modules, modulesPerSecond) => set((state) => ({
    economy: {
      ...state.economy,
      modules,
      modulesPerSecond,
    },
  })),
  
  spendModules: (amount) => {
    const { economy } = get();
    if (economy.modules >= amount) {
      set((state) => ({
        economy: {
          ...state.economy,
          modules: state.economy.modules - amount,
        },
      }));
      return true;
    }
    return false;
  },
  
  unlockNode: (nodeType) => set((state) => {
    const newUnlocked = new Set(state.research.unlockedNodes);
    newUnlocked.add(nodeType);
    return {
      research: {
        ...state.research,
        unlockedNodes: newUnlocked,
      },
    };
  }),
  
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, goal],
  })),
  
  updateGoal: (index, current) => set((state) => ({
    goals: state.goals.map((goal, i) =>
      i === index
        ? { ...goal, current, completed: current >= goal.target }
        : goal
    ),
  })),
  
  // Simulation tick (will be implemented with game logic)
  tick: () => {
    const state = get();
    if (state.isPaused) return;
    
    const now = Date.now();
    
    // Update last tick
    set({ lastTick: now });
    
    // Game logic will be implemented here in simulation engine
  },
}));
