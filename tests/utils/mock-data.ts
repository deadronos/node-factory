// Mock data utilities for testing
import type { Node, Edge } from 'reactflow'
import type {
  FactoryNodeData,
  BeltData,
  MinerNodeData,
  RefinerNodeData,
  AssemblerNodeData,
  StorageNodeData,
  SplitterNodeData,
  ResourceType,
  NodeType,
} from '../../src/types/game'

// Helper to create mock nodes
export function createMockNode<T extends FactoryNodeData>(
  id: string,
  type: NodeType,
  data: Partial<T> = {},
  position: { x: number; y: number } = { x: 0, y: 0 }
): Node<T> {
  const baseData = {
    type,
    status: 'idle' as const,
    outputBuffers: [],
    inputBuffers: [],
    productionRate: 1.0,
    level: 1,
    ...data,
  } as T

  return {
    id,
    type: 'custom',
    position,
    data: baseData,
  }
}

// Mock miner node
export function createMockMinerNode(
  id: string = 'miner-1',
  oreAmount: number = 10,
  capacity: number = 20
): Node<MinerNodeData> {
  return createMockNode<MinerNodeData>(id, 'miner', {
    status: 'producing',
    outputBuffers: [{
      type: 'ore',
      amount: oreAmount,
      capacity,
    }],
    productionRate: 2.0,
  })
}

// Mock refiner node
export function createMockRefinerNode(
  id: string = 'refiner-1',
  oreAmount: number = 5,
  ingotAmount: number = 0,
  capacity: number = 15
): Node<RefinerNodeData> {
  return createMockNode<RefinerNodeData>(id, 'refiner', {
    status: 'producing',
    inputBuffers: [{
      type: 'ore',
      amount: oreAmount,
      capacity,
    }],
    outputBuffers: [{
      type: 'ingots',
      amount: ingotAmount,
      capacity,
    }],
    recipe: {
      inputs: { ore: 1, ingots: 0, modules: 0 },
      outputs: { ore: 0, ingots: 1, modules: 0 },
      processingTime: 10,
    },
    progress: 0,
    productionRate: 1.5,
  })
}

// Mock assembler node
export function createMockAssemblerNode(
  id: string = 'assembler-1',
  ingotAmount: number = 10,
  moduleAmount: number = 0,
  capacity: number = 15
): Node<AssemblerNodeData> {
  return createMockNode<AssemblerNodeData>(id, 'assembler', {
    status: 'producing',
    inputBuffers: [{
      type: 'ingots',
      amount: ingotAmount,
      capacity,
    }],
    outputBuffers: [{
      type: 'modules',
      amount: moduleAmount,
      capacity,
    }],
    recipe: {
      inputs: { ore: 0, ingots: 2, modules: 0 },
      outputs: { ore: 0, ingots: 0, modules: 1 },
      processingTime: 15,
    },
    progress: 0,
    productionRate: 1.0,
  })
}

// Mock storage node
export function createMockStorageNode(
  id: string = 'storage-1',
  resourceType: ResourceType = 'ore',
  amount: number = 50,
  capacity: number = 100
): Node<StorageNodeData> {
  return createMockNode<StorageNodeData>(id, 'storage', {
    inputBuffers: [{
      type: resourceType,
      amount,
      capacity,
    }],
    outputBuffers: [{
      type: resourceType,
      amount: 0,
      capacity,
    }],
  })
}

// Mock splitter node
export function createMockSplitterNode(
  id: string = 'splitter-1',
  resourceType: ResourceType = 'ore',
  amount: number = 10,
  capacity: number = 10
): Node<SplitterNodeData> {
  return createMockNode<SplitterNodeData>(id, 'splitter', {
    inputBuffers: [{
      type: resourceType,
      amount,
      capacity,
    }],
    outputBuffers: [
      {
        type: resourceType,
        amount: 0,
        capacity,
      },
      {
        type: resourceType,
        amount: 0,
        capacity,
      },
    ],
    lastOutput: 0,
  })
}

// Mock belt edge
export function createMockBelt(
  id: string = 'belt-1',
  source: string = 'source-1',
  target: string = 'target-1',
  resourceType: ResourceType | null = null,
  throughput: number = 5.0,
  level: number = 1
): Edge<BeltData> {
  return {
    id,
    source,
    target,
    data: {
      resourceType,
      throughput,
      level,
      flowRate: 0,
    },
  }
}

// Create a complete production chain
interface ProductionChainOptions {
  minerId?: string
  refinerId?: string
  assemblerId?: string
  belt1Id?: string
  belt2Id?: string
}

export function createProductionChain(
  options: ProductionChainOptions = {}
): {
  nodes: Node<FactoryNodeData>[]
  edges: Edge<BeltData>[]
} {
  const {
    minerId = 'miner-1',
    refinerId = 'refiner-1',
    assemblerId = 'assembler-1',
    belt1Id = 'belt-miner-refiner',
    belt2Id = 'belt-refiner-assembler',
  } = options

  const nodes: Node<FactoryNodeData>[] = [
    createMockMinerNode(minerId, 15, 20),
    createMockRefinerNode(refinerId, 0, 0, 15),
    createMockAssemblerNode(assemblerId, 0, 0, 15),
  ]

  const edges: Edge<BeltData>[] = [
    createMockBelt(belt1Id, minerId, refinerId, 'ore', 5.0, 1),
    createMockBelt(belt2Id, refinerId, assemblerId, 'ingots', 5.0, 1),
  ]

  return { nodes, edges }
}

// Create test scenarios
export function createStarvedScenario(): {
  nodes: Node<FactoryNodeData>[]
  edges: Edge<BeltData>[]
} {
  const miner = createMockMinerNode('miner-1', 0, 20) // Empty miner
  const refiner = createMockRefinerNode('refiner-1', 0, 0, 15)
  const belt = createMockBelt('belt-1', 'miner-1', 'refiner-1', 'ore', 5.0, 1)

  return {
    nodes: [miner, refiner],
    edges: [belt],
  }
}

export function createBlockedScenario(): {
  nodes: Node<FactoryNodeData>[]
  edges: Edge<BeltData>[]
} {
  const miner = createMockMinerNode('miner-1', 20, 20) // Full miner
  const refiner = createMockRefinerNode('refiner-1', 15, 15, 15) // Full refiner
  const belt = createMockBelt('belt-1', 'miner-1', 'refiner-1', 'ore', 5.0, 1)

  return {
    nodes: [miner, refiner],
    edges: [belt],
  }
}