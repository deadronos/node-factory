import type { MaterialEdgeData, NodeKind } from "./types";

export const TICK_HZ = 10;
export const TICK_DT = 1 / TICK_HZ;

export const GOAL_MODULES_TOTAL = 50;

export const DEFAULT_BELT: Pick<MaterialEdgeData, "throughputPerSec"> = {
  throughputPerSec: 5,
};

export const NODE_COSTS: Record<NodeKind, number> = {
  miner: 5,
  refiner: 10,
  assembler: 20,
  storage: 8,
};

export const DEFAULT_CAPS = {
  minerOut: 50,
  refinerIn: 30,
  refinerOut: 30,
  assemblerIn: 30,
  assemblerOut: 30,
  storage: 120,
} as const;

export const DEFAULT_RATES = {
  minerOrePerSec: 2.5,
  refinerOreToIngotPerSec: 2,
  assemblerIngotToModulePerSec: 1,
} as const;

export const NODE_TITLES: Record<NodeKind, string> = {
  miner: "Miner",
  refiner: "Refiner",
  assembler: "Assembler",
  storage: "Storage",
};
