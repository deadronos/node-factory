# Nanobot Swarm Factory — V1 Feature Set & Milestones

This document defines a **minimal V1 scope** for a React Flow–based “graph factory” idle-ish webgame, plus a set of **implementation milestones** that get you to “playable fast”.

---

## V1 scope (definition of “playable fast”)

A player can:

- Place a few node types on a **React Flow** canvas
- Connect them with **material edges** (single edge type in V1)
- Press **Run**
- Watch resources flow and totals rise
- Spend earned currency to expand / upgrade
- Reach a simple goal (“make X modules”)

### Hard cuts for V1 (defer to later)

- Multiple edge types (power/command)
- Prestige / planets
- Offline progress
- Blueprints
- Byproducts
- Full tech tree

---

## Minimal V1 Feature Set

### Nodes (only 4 needed)

1) **Miner**  
   - Produces **Ore/sec** (no inputs)  
   - Has an internal output buffer

2) **Refiner**  
   - Consumes **Ore** → produces **Ingots**  
   - Has an input buffer (Ore) + output buffer (Ingots)

3) **Assembler**  
   - Consumes **Ingots** → produces **Modules**  
   - Has an input buffer (Ingots) + output buffer (Modules)

4) **Storage** *(optional but strongly recommended)*  
   - Buffers **one** item type (or “any” if you keep it generic)  
   - Used to stabilize throughput and prevent stall cascades

> V1 goal: keep the model extremely small so you can ship a playable loop quickly.

---

### Edges

- **Material belts only**
- Each edge has a **throughput cap** (e.g., `5 units/sec`) so bottlenecks exist
- Edges carry exactly **one** resource type at a time (auto-detected from upstream output)

---

### Resources

- **Ore**, **Ingots**, **Modules** (that’s it)

---

### Economy

- **Modules** act as the currency:
  - Place more nodes
  - Upgrade belts (or a single node stat)
- Win/goal:
  - Reach **X Modules total** *or*
  - Sustain **Y Modules/min**

---

### Simulation (core loop)

- Deterministic tick (e.g., `10 ticks/sec` fixed-step)
- Each tick:
  - Nodes **produce/consume** based on available inputs and rates
  - Edges **move** material from upstream output buffer → downstream input buffer
  - Throughput + buffer capacity create natural bottlenecks

---

### UX essentials

- Node palette (add Miner/Refiner/Assembler/Storage)
- Drag nodes, connect handles, delete nodes/edges
- Click node → mini inspector (rate, buffers, “Starved/Blocked”)
- Top bar with totals + per-second rates
- Save/load to **localStorage** *(nice-to-have, small effort)*

---

## Milestones (build order)

Each milestone ends in a **demonstrably playable** increment.

### M0 — Skeleton “it runs”
- React Flow canvas with pan/zoom
- Node palette: add nodes to canvas
- Basic node UI (title, small icon/label)
- Connect edges (handles working)
- Delete node/edge

**Done when:** you can place nodes and connect them like a diagram editor.

---

### M1 — Resource model + single-node sim
- Implement a tick loop (fixed timestep)
- Miner generates Ore into its internal buffer
- Display buffer amount on the Miner node (e.g., `Ore: 12.3`)

**Done when:** a lone Miner visibly accumulates Ore over time.

---

### M2 — Belt transport (edge throughput)
- Edges move resources from output buffer → input buffer
- Throughput cap per edge
- Simple animation: moving dots or “flow” indicator when nonzero

**Done when:** Miner connected to Storage results in Storage filling at edge throughput.

---

### M3 — Production chain (Miner → Refiner → Assembler)
- Refiner: consumes Ore, produces Ingots
- Assembler: consumes Ingots, produces Modules
- Each node has:
  - input buffer(s)
  - output buffer
  - base rate (units/sec)
- “Starved/Blocked” state displayed (tiny label)

**Done when:** full chain produces Modules continuously and you can *see* where it bottlenecks.

---

### M4 — Costs + build loop (turns it into a game)
- Start with a small “starting kit” (1 Miner, 1 Refiner, 1 Assembler)
- Placing a new node costs Modules
- Add a goal: `Produce 50 Modules` (progress bar)

**Done when:** player can expand the factory using earned Modules and reach a clear objective.

---

### M5 — Upgrades (one upgrade path only)
Pick **one** upgrade line for V1 (belts recommended):

- **Belt Mk2:** upgrade selected edge throughput  
  *(Alternative: +output for Miner or better conversion for Refiner)*

UI: click edge/node → **Upgrade** button (costs Modules)

**Done when:** player can identify a bottleneck and fix it via upgrades.

---

### M6 — Minimal “Tech” (tiny unlock gate)
Add a “Research” panel without a full tree:

- Spend Modules to unlock **Storage** (if you cut it initially) and/or **Splitter**
- Example: Unlock Splitter for `100 Modules`

**Done when:** the game introduces a new node after some progression.

---

### M7 — Splitter (first real graph puzzle)
- Splitter node: 1 input → 2 outputs (round-robin or proportional)
- Enables parallel scaling (2x refiners/assemblers fed from 1 miner)

**Done when:** player can build parallel lines and scale output beyond a single chain.

---

## Optional mini-milestones (big payoff, small polish)

### M8 — Analytics overlay
- Highlight edges at ~90% capacity
- Show per-edge flow rate on hover

### M9 — Save/Load
- Serialize nodes/edges + resources to localStorage

### M10 — Tutorial hints
- “Your Refiner is starved — add another Miner or increase belt throughput.”

---

## Smallest fun slice (if you want to ship ASAP)

Build **M0 → M1 → M2 → M3 → M4**.

That yields a complete loop: **connect chain → watch Modules rise → buy more nodes → optimize**.
