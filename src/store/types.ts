export type ResourceType = 'Ore' | 'Ingot' | 'Module';

export interface NodeData {
  label: string;
  type: 'Miner' | 'Refiner' | 'Assembler' | 'Storage';
  // Buffers: mapping resource type to amount
  inputBuffer: Record<string, number>;
  outputBuffer: Record<string, number>;
  // Config
  productionRate: number; // Items per second
  productionProgress?: number; // 0 to 1
  recipe?: {
    input: { type: ResourceType; amount: number };
    output: { type: ResourceType; amount: number };
  };
}

export interface ItemPayload {
    id: string;
    type: ResourceType;
    progress: number; // 0 to 1
}

export interface EdgeData {
    items: ItemPayload[];
    throughput?: number; // Items per second
    length?: number; // Virtual length for simulation
}
