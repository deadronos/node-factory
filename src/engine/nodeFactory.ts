import type { Node } from 'reactflow';
import type {
  FactoryNodeData,
  NodeType,
  MinerNodeData,
  RefinerNodeData,
  AssemblerNodeData,
  StorageNodeData,
  SplitterNodeData,
} from '../types/game';
import { BASE_RATES, BUFFER_CAPACITIES, RECIPES } from '../types/game';

// Create a new factory node with proper type and initial data
export function createFactoryNode(
  type: NodeType,
  position: { x: number; y: number }
): Node<FactoryNodeData> {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseData = {
    type,
    status: 'idle' as const,
    productionRate: BASE_RATES[type],
    level: 1,
  };
  
  let data: FactoryNodeData;
  
  switch (type) {
    case 'miner':
      data = {
        ...baseData,
        type: 'miner',
        inputBuffers: [],
        outputBuffers: [
          {
            type: 'ore',
            amount: 0,
            capacity: BUFFER_CAPACITIES.miner,
          },
        ],
      } as MinerNodeData;
      break;
      
    case 'refiner':
      data = {
        ...baseData,
        type: 'refiner',
        recipe: RECIPES.refiner,
        progress: 0,
        inputBuffers: [
          {
            type: 'ore',
            amount: 0,
            capacity: BUFFER_CAPACITIES.refiner,
          },
        ],
        outputBuffers: [
          {
            type: 'ingots',
            amount: 0,
            capacity: BUFFER_CAPACITIES.refiner,
          },
        ],
      } as RefinerNodeData;
      break;
      
    case 'assembler':
      data = {
        ...baseData,
        type: 'assembler',
        recipe: RECIPES.assembler,
        progress: 0,
        inputBuffers: [
          {
            type: 'ingots',
            amount: 0,
            capacity: BUFFER_CAPACITIES.assembler,
          },
        ],
        outputBuffers: [
          {
            type: 'modules',
            amount: 0,
            capacity: BUFFER_CAPACITIES.assembler,
          },
        ],
      } as AssemblerNodeData;
      break;
      
    case 'storage':
      data = {
        ...baseData,
        type: 'storage',
        inputBuffers: [
          {
            type: 'ore', // Default, can store any type
            amount: 0,
            capacity: BUFFER_CAPACITIES.storage,
          },
        ],
        outputBuffers: [
          {
            type: 'ore', // Same buffer serves as both input and output
            amount: 0,
            capacity: BUFFER_CAPACITIES.storage,
          },
        ],
      } as StorageNodeData;
      break;
      
    case 'splitter':
      data = {
        ...baseData,
        type: 'splitter',
        lastOutput: 0,
        inputBuffers: [
          {
            type: 'ore', // Can split any type
            amount: 0,
            capacity: BUFFER_CAPACITIES.splitter,
          },
        ],
        outputBuffers: [
          {
            type: 'ore',
            amount: 0,
            capacity: BUFFER_CAPACITIES.splitter,
          },
        ],
      } as SplitterNodeData;
      break;
      
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
  
  return {
    id,
    type,
    position,
    data,
  };
}
