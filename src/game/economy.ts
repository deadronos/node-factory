import type { Node } from "reactflow";
import type { NodeData } from "./types";

const EPS = 1e-6;

export function countAvailableModules(nodes: Node<NodeData>[]): number {
  let total = 0;
  for (const n of nodes) {
    const sim = n.data.sim;
    if (sim.kind === "assembler" && sim.out.type === "Modules") total += sim.out.amount;
    if (sim.kind === "storage" && sim.lockedType === "Modules") total += sim.amount;
  }
  return total;
}

// Deterministic drain: nodes sorted by id, assemblers before storage.
export function spendModules(nodes: Node<NodeData>[], cost: number): Node<NodeData>[] {
  if (cost <= 0) return nodes;

  let remaining = cost;
  const sorted = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

  function drainFromNode(n: Node<NodeData>, amount: number): [Node<NodeData>, number] {
    const sim = n.data.sim;
    if (amount <= EPS) return [n, 0];

    if (sim.kind === "assembler") {
      const available = sim.out.type === "Modules" ? sim.out.amount : 0;
      const take = Math.min(available, amount);
      if (take <= EPS) return [n, 0];
      return [
        {
          ...n,
          data: {
            ...n.data,
            sim: {
              ...sim,
              out: { ...sim.out, amount: sim.out.amount - take },
            },
          },
        },
        take,
      ];
    }

    if (sim.kind === "storage" && sim.lockedType === "Modules") {
      const take = Math.min(sim.amount, amount);
      if (take <= EPS) return [n, 0];
      return [
        {
          ...n,
          data: {
            ...n.data,
            sim: { ...sim, amount: sim.amount - take },
          },
        },
        take,
      ];
    }

    return [n, 0];
  }

  const drainedAssemblers: Node<NodeData>[] = [];
  const drainedStorage: Node<NodeData>[] = [];
  const others: Node<NodeData>[] = [];

  for (const n of sorted) {
    if (n.data.sim.kind === "assembler") drainedAssemblers.push(n);
    else if (n.data.sim.kind === "storage") drainedStorage.push(n);
    else others.push(n);
  }

  const drainOrder = [...drainedAssemblers, ...drainedStorage, ...others];
  const updated = drainOrder.map((n) => {
    if (remaining <= EPS) return n;
    const [next, took] = drainFromNode(n, remaining);
    remaining -= took;
    return next;
  });

  // Put nodes back into original order.
  const byId = new Map(updated.map((n) => [n.id, n] as const));
  return nodes.map((n) => byId.get(n.id) ?? n);
}
