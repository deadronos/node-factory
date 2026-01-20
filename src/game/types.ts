export type ResourceType = "Ore" | "Ingots" | "Modules";

export type NodeKind = "miner" | "refiner" | "assembler" | "storage";

export type NodeStatus = "Running" | "Starved" | "Blocked";

export type BufferState = {
  type: ResourceType;
  amount: number;
  capacity: number;
};

export type MinerSim = {
  kind: "miner";
  orePerSec: number;
  out: BufferState; // Ore
  status: NodeStatus;
};

export type RefinerSim = {
  kind: "refiner";
  oreToIngotPerSec: number;
  input: BufferState; // Ore
  out: BufferState; // Ingots
  status: NodeStatus;
};

export type AssemblerSim = {
  kind: "assembler";
  ingotToModulePerSec: number;
  input: BufferState; // Ingots
  out: BufferState; // Modules
  status: NodeStatus;
};

export type StorageSim = {
  kind: "storage";
  // Storage locks to the first received resource type.
  lockedType: ResourceType | null;
  amount: number;
  capacity: number;
  status: NodeStatus;
};

export type NodeSim = MinerSim | RefinerSim | AssemblerSim | StorageSim;

export type NodeData = {
  kind: NodeKind;
  title: string;
  sim: NodeSim;
};

export type MaterialEdgeData = {
  throughputPerSec: number;
  // Derived each tick, for UI.
  resourceType: ResourceType | null;
  flowPerSec: number;
};
