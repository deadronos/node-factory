// Core resource types
export type ResourceType = 'ore' | 'ingots' | 'modules';

// Node types in the factory
export type NodeType = 'miner' | 'refiner' | 'assembler' | 'storage' | 'splitter';

// Node state status
export type NodeStatus = 'idle' | 'producing' | 'starved' | 'blocked';

// Resource buffer for storing materials
export interface ResourceBuffer {
  type: ResourceType;
  amount: number;
  capacity: number;
}

// Production recipe defining input/output ratios
export interface Recipe {
  inputs: Record<ResourceType, number>;  // e.g., { ore: 1 }
  outputs: Record<ResourceType, number>; // e.g., { ingots: 1 }
  processingTime: number; // ticks per production cycle
}

// Base node data that all factory nodes share
export interface BaseNodeData {
  type: NodeType;
  status: NodeStatus;
  outputBuffers: ResourceBuffer[];
  inputBuffers: ResourceBuffer[];
  productionRate: number; // units per second
  level: number; // upgrade level
}

// Miner-specific data (produces ore from nothing)
export interface MinerNodeData extends BaseNodeData {
  type: 'miner';
}

// Refiner-specific data (ore -> ingots)
export interface RefinerNodeData extends BaseNodeData {
  type: 'refiner';
  recipe: Recipe;
  progress: number; // current recipe progress (0-1)
}

// Assembler-specific data (ingots -> modules)
export interface AssemblerNodeData extends BaseNodeData {
  type: 'assembler';
  recipe: Recipe;
  progress: number;
}

// Storage-specific data (stores any one resource type)
export interface StorageNodeData extends BaseNodeData {
  type: 'storage';
}

// Splitter-specific data (1 input -> 2 outputs, round-robin)
export interface SplitterNodeData extends BaseNodeData {
  type: 'splitter';
  lastOutput: number; // tracks which output was used last (0 or 1)
}

// Union type for all node data types
export type FactoryNodeData =
  | MinerNodeData
  | RefinerNodeData
  | AssemblerNodeData
  | StorageNodeData
  | SplitterNodeData;

// Edge/Belt data for material transport
export interface BeltData {
  resourceType: ResourceType | null; // what resource flows through
  throughput: number; // units per second
  level: number; // upgrade level (affects throughput)
  flowRate: number; // current flow rate for visualization
}

// Game economy and progression
export interface Economy {
  modules: number; // current module count
  totalModulesProduced: number; // lifetime total
  modulesPerSecond: number; // current production rate
}

// Research/Tech tree
export interface Research {
  unlockedNodes: Set<NodeType>;
  unlockedUpgrades: Set<string>;
}

// Node cost structure
export interface NodeCost {
  modules: number;
}

// Upgrade cost structure
export interface UpgradeCost {
  modules: number;
}

// Game goal/objective
export interface Goal {
  type: 'total' | 'rate';
  target: number;
  current: number;
  completed: boolean;
}

// Complete game state
export interface GameState {
  economy: Economy;
  research: Research;
  goals: Goal[];
  isPaused: boolean;
  tickRate: number; // ticks per second
  lastTick: number; // timestamp of last tick
}

// Node costs by type
export const NODE_COSTS: Record<NodeType, NodeCost> = {
  miner: { modules: 10 },
  refiner: { modules: 15 },
  assembler: { modules: 20 },
  storage: { modules: 5 },
  splitter: { modules: 25 },
};

// Base production rates (units per second)
export const BASE_RATES: Record<NodeType, number> = {
  miner: 2.0,
  refiner: 1.5,
  assembler: 1.0,
  storage: 0,
  splitter: 0,
};

// Buffer capacities
export const BUFFER_CAPACITIES: Record<NodeType, number> = {
  miner: 20,
  refiner: 15,
  assembler: 15,
  storage: 100,
  splitter: 10,
};

// Recipes for production nodes
export const RECIPES: Record<'refiner' | 'assembler', Recipe> = {
  refiner: {
    inputs: { ore: 1, ingots: 0, modules: 0 },
    outputs: { ore: 0, ingots: 1, modules: 0 },
    processingTime: 10, // ticks
  },
  assembler: {
    inputs: { ore: 0, ingots: 2, modules: 0 },
    outputs: { ore: 0, ingots: 0, modules: 1 },
    processingTime: 15, // ticks
  },
};

// Base belt throughput (units per second)
export const BASE_BELT_THROUGHPUT = 5.0;

// Belt upgrade levels and throughput multipliers
export const BELT_UPGRADES = [
  { level: 1, throughput: 5.0, cost: 0 },
  { level: 2, throughput: 10.0, cost: 50 },
  { level: 3, throughput: 20.0, cost: 150 },
];
