import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "reactflow";
import { DEFAULT_BELT, DEFAULT_CAPS, DEFAULT_RATES, GOAL_MODULES_TOTAL, NODE_COSTS, NODE_TITLES } from "@/game/config";
import type { MaterialEdgeData, NodeData, NodeKind, NodeSim } from "@/game/types";
import { countAvailableModules, spendModules } from "@/game/economy";
import { tickSim } from "@/game/sim";

type GameState = {
  idCounter: number;
  nodes: Node<NodeData>[];
  edges: Edge<MaterialEdgeData>[];
  isRunning: boolean;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  modulesProducedTotal: number;
  lastModulesPerSec: number;
  hasWon: boolean;

  initNewGame: () => void;
  setRunning: (running: boolean) => void;
  toggleRunning: () => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  setSelection: (sel: { nodeId: string | null; edgeId: string | null }) => void;

  canAfford: (kind: NodeKind) => boolean;
  addNode: (kind: NodeKind) => void;
  tick: (dt: number) => void;
};

function makeNodeSim(kind: NodeKind): NodeSim {
  switch (kind) {
    case "miner":
      return {
        kind: "miner",
        orePerSec: DEFAULT_RATES.minerOrePerSec,
        out: { type: "Ore", amount: 0, capacity: DEFAULT_CAPS.minerOut },
        status: "Running",
      };
    case "refiner":
      return {
        kind: "refiner",
        oreToIngotPerSec: DEFAULT_RATES.refinerOreToIngotPerSec,
        input: { type: "Ore", amount: 0, capacity: DEFAULT_CAPS.refinerIn },
        out: { type: "Ingots", amount: 0, capacity: DEFAULT_CAPS.refinerOut },
        status: "Starved",
      };
    case "assembler":
      return {
        kind: "assembler",
        ingotToModulePerSec: DEFAULT_RATES.assemblerIngotToModulePerSec,
        input: { type: "Ingots", amount: 0, capacity: DEFAULT_CAPS.assemblerIn },
        out: { type: "Modules", amount: 0, capacity: DEFAULT_CAPS.assemblerOut },
        status: "Starved",
      };
    case "storage":
      return {
        kind: "storage",
        lockedType: null,
        amount: 0,
        capacity: DEFAULT_CAPS.storage,
        status: "Running",
      };
  }
}

function nextId(prefix: string, counter: number) {
  return `${prefix}${counter}`;
}

export const useGameStore = create<GameState>((set, get) => ({
  idCounter: 1,
  nodes: [],
  edges: [],
  isRunning: false,
  selectedNodeId: null,
  selectedEdgeId: null,
  modulesProducedTotal: 0,
  lastModulesPerSec: 0,
  hasWon: false,

  initNewGame: () => {
    const minerId = "n1";
    const refinerId = "n2";
    const assemblerId = "n3";
    const e1 = "e1";
    const e2 = "e2";

    const nodes: Node<NodeData>[] = [
      {
        id: minerId,
        type: "miner",
        position: { x: 80, y: 140 },
        data: { kind: "miner", title: NODE_TITLES.miner, sim: makeNodeSim("miner") },
      },
      {
        id: refinerId,
        type: "refiner",
        position: { x: 380, y: 140 },
        data: { kind: "refiner", title: NODE_TITLES.refiner, sim: makeNodeSim("refiner") },
      },
      {
        id: assemblerId,
        type: "assembler",
        position: { x: 680, y: 140 },
        data: { kind: "assembler", title: NODE_TITLES.assembler, sim: makeNodeSim("assembler") },
      },
    ];

    const edges: Edge<MaterialEdgeData>[] = [
      {
        id: e1,
        type: "material",
        source: minerId,
        target: refinerId,
        data: { ...DEFAULT_BELT, resourceType: null, flowPerSec: 0 },
      },
      {
        id: e2,
        type: "material",
        source: refinerId,
        target: assemblerId,
        data: { ...DEFAULT_BELT, resourceType: null, flowPerSec: 0 },
      },
    ];

    set({
      idCounter: 4,
      nodes,
      edges,
      isRunning: false,
      selectedNodeId: null,
      selectedEdgeId: null,
      modulesProducedTotal: 0,
      lastModulesPerSec: 0,
      hasWon: false,
    });
  },

  setRunning: (running) => set({ isRunning: running }),
  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),

  onNodesChange: (changes) => set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),
  onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),
  onConnect: (connection) =>
    set((s) => ({
      edges: addEdge(
        {
          ...connection,
          type: "material",
          data: { ...DEFAULT_BELT, resourceType: null, flowPerSec: 0 },
        },
        s.edges,
      ),
    })),

  setSelection: ({ nodeId, edgeId }) => set({ selectedNodeId: nodeId, selectedEdgeId: edgeId }),

  canAfford: (kind) => {
    const cost = NODE_COSTS[kind];
    const available = countAvailableModules(get().nodes);
    return available >= cost;
  },

  addNode: (kind) => {
    const cost = NODE_COSTS[kind];
    const available = countAvailableModules(get().nodes);
    if (available < cost) return;

    set((s) => {
      const id = nextId("n", s.idCounter);
      const pos = {
        x: Math.max(40, window.innerWidth / 2 - 120 + (Math.random() * 60 - 30)),
        y: Math.max(40, window.innerHeight / 2 - 160 + (Math.random() * 60 - 30)),
      };
      const newNode: Node<NodeData> = {
        id,
        type: kind,
        position: pos,
        data: { kind, title: NODE_TITLES[kind], sim: makeNodeSim(kind) },
      };
      const nodesPaid = spendModules(s.nodes, cost);
      return {
        idCounter: s.idCounter + 1,
        nodes: nodesPaid.concat(newNode),
      };
    });
  },

  tick: (dt) => {
    const s = get();
    if (!s.isRunning) return;

    set((prev) => {
      const res = tickSim(prev.nodes, prev.edges, dt);
      const nextProducedTotal = prev.modulesProducedTotal + res.producedModulesThisTick;
      return {
        nodes: res.nodes,
        edges: res.edges,
        modulesProducedTotal: nextProducedTotal,
        lastModulesPerSec: dt > 0 ? res.producedModulesThisTick / dt : 0,
        hasWon: nextProducedTotal >= GOAL_MODULES_TOTAL,
      };
    });
  },
}));
