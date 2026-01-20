import type { Edge, Node } from "reactflow";
import type {
  AssemblerSim,
  MaterialEdgeData,
  MinerSim,
  NodeData,
  NodeSim,
  NodeStatus,
  RefinerSim,
  ResourceType,
  StorageSim,
} from "./types";

const EPS = 1e-6;

export type TickResult = {
  nodes: Node<NodeData>[];
  edges: Edge<MaterialEdgeData>[];
  producedModulesThisTick: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeStatus(sim: NodeSim): NodeStatus {
  switch (sim.kind) {
    case "miner":
      return sim.out.amount >= sim.out.capacity - EPS ? "Blocked" : "Running";
    case "refiner": {
      const starved = sim.input.amount <= EPS;
      const blocked = sim.out.amount >= sim.out.capacity - EPS;
      if (blocked) return "Blocked";
      if (starved) return "Starved";
      return "Running";
    }
    case "assembler": {
      const starved = sim.input.amount <= EPS;
      const blocked = sim.out.amount >= sim.out.capacity - EPS;
      if (blocked) return "Blocked";
      if (starved) return "Starved";
      return "Running";
    }
    case "storage":
      return sim.amount >= sim.capacity - EPS ? "Blocked" : "Running";
  }
}

function getOutput(sim: NodeSim): { type: ResourceType; amount: number; capacity: number } | null {
  switch (sim.kind) {
    case "miner":
      return sim.out;
    case "refiner":
      return sim.out;
    case "assembler":
      return sim.out;
    case "storage": {
      if (!sim.lockedType) return null;
      return { type: sim.lockedType, amount: sim.amount, capacity: sim.capacity };
    }
  }
}

function canAcceptInput(sim: NodeSim, resourceType: ResourceType): boolean {
  switch (sim.kind) {
    case "miner":
      return false;
    case "refiner":
      return resourceType === "Ore";
    case "assembler":
      return resourceType === "Ingots";
    case "storage":
      return sim.lockedType === null || sim.lockedType === resourceType;
  }
}

function getInputFree(sim: NodeSim): number {
  switch (sim.kind) {
    case "miner":
      return 0;
    case "refiner":
      return Math.max(0, sim.input.capacity - sim.input.amount);
    case "assembler":
      return Math.max(0, sim.input.capacity - sim.input.amount);
    case "storage":
      return Math.max(0, sim.capacity - sim.amount);
  }
}

function addToInput(sim: NodeSim, resourceType: ResourceType, delta: number): NodeSim {
  if (delta <= EPS) return sim;
  switch (sim.kind) {
    case "refiner": {
      const next: RefinerSim = {
        ...sim,
        input: {
          ...sim.input,
          amount: clamp(sim.input.amount + delta, 0, sim.input.capacity),
        },
      };
      return next;
    }
    case "assembler": {
      const next: AssemblerSim = {
        ...sim,
        input: {
          ...sim.input,
          amount: clamp(sim.input.amount + delta, 0, sim.input.capacity),
        },
      };
      return next;
    }
    case "storage": {
      const lockedType = sim.lockedType ?? resourceType;
      const next: StorageSim = {
        ...sim,
        lockedType,
        amount: clamp(sim.amount + delta, 0, sim.capacity),
      };
      return next;
    }
    default:
      return sim;
  }
}

function takeFromOutput(sim: NodeSim, delta: number): NodeSim {
  if (delta <= EPS) return sim;
  switch (sim.kind) {
    case "miner": {
      const next: MinerSim = {
        ...sim,
        out: { ...sim.out, amount: clamp(sim.out.amount - delta, 0, sim.out.capacity) },
      };
      return next;
    }
    case "refiner": {
      const next: RefinerSim = {
        ...sim,
        out: { ...sim.out, amount: clamp(sim.out.amount - delta, 0, sim.out.capacity) },
      };
      return next;
    }
    case "assembler": {
      const next: AssemblerSim = {
        ...sim,
        out: { ...sim.out, amount: clamp(sim.out.amount - delta, 0, sim.out.capacity) },
      };
      return next;
    }
    case "storage": {
      const nextAmount = clamp(sim.amount - delta, 0, sim.capacity);
      const next: StorageSim = {
        ...sim,
        amount: nextAmount,
        lockedType: nextAmount <= EPS ? sim.lockedType : sim.lockedType,
      };
      return next;
    }
  }
}

function processNodes(simById: Map<string, NodeSim>, dt: number): { simById: Map<string, NodeSim>; producedModules: number } {
  let producedModules = 0;
  const next = new Map(simById);

  for (const [id, sim] of simById.entries()) {
    switch (sim.kind) {
      case "miner": {
        const produced = sim.orePerSec * dt;
        const room = sim.out.capacity - sim.out.amount;
        const actual = Math.max(0, Math.min(produced, room));
        const updated: MinerSim = {
          ...sim,
          out: { ...sim.out, amount: sim.out.amount + actual },
        };
        next.set(id, updated);
        break;
      }
      case "refiner": {
        const room = sim.out.capacity - sim.out.amount;
        const canMake = Math.min(sim.input.amount, sim.oreToIngotPerSec * dt, room);
        if (canMake > EPS) {
          const updated: RefinerSim = {
            ...sim,
            input: { ...sim.input, amount: sim.input.amount - canMake },
            out: { ...sim.out, amount: sim.out.amount + canMake },
          };
          next.set(id, updated);
        }
        break;
      }
      case "assembler": {
        const room = sim.out.capacity - sim.out.amount;
        const canMake = Math.min(sim.input.amount, sim.ingotToModulePerSec * dt, room);
        if (canMake > EPS) {
          producedModules += canMake;
          const updated: AssemblerSim = {
            ...sim,
            input: { ...sim.input, amount: sim.input.amount - canMake },
            out: { ...sim.out, amount: sim.out.amount + canMake },
          };
          next.set(id, updated);
        }
        break;
      }
      case "storage":
        // no-op
        break;
    }
  }

  return { simById: next, producedModules };
}

function moveAlongEdges(
  simById: Map<string, NodeSim>,
  edges: Edge<MaterialEdgeData>[],
  dt: number,
): { simById: Map<string, NodeSim>; edges: Edge<MaterialEdgeData>[] } {
  const nextSim = new Map(simById);
  const sortedEdges = [...edges].sort((a, b) => a.id.localeCompare(b.id));
  const nextEdges: Edge<MaterialEdgeData>[] = [];
  const originalIndex = new Map(edges.map((e, idx) => [e.id, idx] as const));

  for (const edge of sortedEdges) {
    const src = nextSim.get(edge.source);
    const dst = nextSim.get(edge.target);
    const throughputPerSec = edge.data?.throughputPerSec ?? 5;

    if (!src || !dst) {
      nextEdges.push(edge);
      continue;
    }

    const out = getOutput(src);
    if (!out) {
      nextEdges.push({
        ...edge,
        data: {
          ...(edge.data ?? { throughputPerSec }),
          resourceType: null,
          flowPerSec: 0,
        },
      });
      continue;
    }

    if (!canAcceptInput(dst, out.type)) {
      nextEdges.push({
        ...edge,
        data: {
          ...(edge.data ?? { throughputPerSec }),
          resourceType: out.type,
          flowPerSec: 0,
        },
      });
      continue;
    }

    const maxMove = throughputPerSec * dt;
    const dstFree = getInputFree(dst);
    const moved = Math.max(0, Math.min(maxMove, out.amount, dstFree));

    const srcNext = takeFromOutput(src, moved);
    const dstNext = addToInput(dst, out.type, moved);
    nextSim.set(edge.source, srcNext);
    nextSim.set(edge.target, dstNext);

    nextEdges.push({
      ...edge,
      data: {
        ...(edge.data ?? { throughputPerSec }),
        throughputPerSec,
        resourceType: out.type,
        flowPerSec: dt > 0 ? moved / dt : 0,
      },
    });
  }

  // Restore original order for React Flow stability.
  nextEdges.sort((a, b) => (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0));

  return { simById: nextSim, edges: nextEdges };
}

export function tickSim(
  nodes: Node<NodeData>[],
  edges: Edge<MaterialEdgeData>[],
  dt: number,
): TickResult {
  const simById = new Map<string, NodeSim>();
  for (const n of nodes) {
    simById.set(n.id, n.data.sim);
  }

  const processed = processNodes(simById, dt);
  const moved = moveAlongEdges(processed.simById, edges, dt);

  const nextNodes: Node<NodeData>[] = nodes.map((n) => {
    const sim = moved.simById.get(n.id) ?? n.data.sim;
    const status = computeStatus(sim);
    const nextSim = { ...sim, status } as NodeSim;
    return {
      ...n,
      data: {
        ...n.data,
        sim: nextSim,
      },
    };
  });

  return {
    nodes: nextNodes,
    edges: moved.edges,
    producedModulesThisTick: processed.producedModules,
  };
}
