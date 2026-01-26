# Copilot / AI Agent Instructions for node-factory ✅

Summary
- This is a small React + TypeScript + Vite game prototype that models a factory simulation (nodes, belts, resources). Key responsibilities are split across a pure simulation engine, a zustand store (game state), and a ReactFlow-based UI.

Quick start (commands)
- Dev: `pnpm dev` (runs Vite dev server)
- Build: `pnpm build` (TypeScript build + Vite build)
- Lint: `pnpm lint`
- Tests: `pnpm test` (run all), `pnpm test:unit`, `pnpm test:component`, `pnpm test:integration`, `pnpm test:watch`, `pnpm test:coverage`

Big-picture architecture (what to know first) 🔧
- Engine: `src/engine/*` contains pure simulation logic (e.g., `simulateTick`, `transferAlongBelt`, `updateMiner`, `updateRefiner`). These functions operate on `reactflow` nodes/edges and return `Partial` updates (do not mutate inputs). See `src/engine/simulation.ts`.
- Types/Rules: `src/types/game.ts` is the single source of truth for domain types, constants (e.g., `BASE_RATES`, `RECIPES`, `BUFFER_CAPACITIES`, belt throughput/levels). Modify here for domain-level changes.
- State: `src/store/gameStore.ts` (Zustand) holds nodes, edges, economy, research, and tick controls. Use provided actions (`setNodes`, `updateNodeData`, `addEdge`, etc.).
- UI: `src/components/flow/FlowCanvas.tsx` wires state → simulation loop → rendering via `reactflow`. Custom node components live in `src/components/nodes/*`.

Patterns & conventions (concrete, not generic) 📐
- Simulation functions return Partial updates. Caller (FlowCanvas / tests) merges these into node/edge objects. Keep engine functions pure and side-effect-free.
- Resource buffers are arrays of `ResourceBuffer` on nodes (inputBuffers/outputBuffers). Most code reads/updates index 0, but components like splitters use multiple outputs.
- Edge/Belt data lives on `Edge.data` with `BeltData` shape: `{ resourceType: ResourceType | null, throughput, level, flowRate }`. `resourceType` may be null (inferred from source output) — engine handles that.
- Tick timing: engine computes based on deltaTime; `TICK_DELTA = 0.1` (10 ticks/sec) in `src/engine/simulation.ts`. FlowCanvas runs setInterval at 100ms for the simulation.
- Testing helpers: Tests consistently use `tests/utils/mock-data.ts` to create nodes/belts (`createMockMinerNode`, `createProductionChain`, etc.). Add new mocks there when adding node types.

How to add a new node type (example workflow) ⚙️
1. Add the type to the `NodeType` union in `src/types/game.ts` and include costs/BASE_RATES/BUFFER_CAPACITIES/RECIPES if applicable.
2. Extend domain types (if needed) in `src/types/game.ts` and add new constants.
3. Update `createFactoryNode` in `src/engine/nodeFactory.ts` to return initial `FactoryNodeData` for the new node.
4. Implement update logic in `src/engine/simulation.ts` (follow existing `update*` patterns — return partial updates, keep pure).
5. Add a UI node component to `src/components/nodes/<YourNode>Node.tsx` and wire it into `nodeTypes` in `FlowCanvas`.
6. Add unit tests: engine unit test in `tests/unit/simulation-engine.test.ts` (use mocks) and store/component tests as needed (`tests/utils/mock-data.ts`, `tests/component/*`).

Testing conventions & examples ✅
- Unit tests target engine behavior (see `tests/unit/simulation-engine.test.ts`). Use `createMock*` helpers for scenarios (production, starved, blocked).
- When asserting transfers, compare amounts with tolerances; tests often check status strings (`producing`, `starved`, `blocked`).
- Component tests live in `tests/component` and use testing-library.

Code style & dev hygiene
- TypeScript strict mode is enabled. Keep types precise and use the shared types in `src/types/game.ts`.
- Linting/formatting via ESLint + Prettier. Run `pnpm lint` before creating PRs.

Debugging tips
- Run `pnpm dev` and reproduce the flow in the browser; `FlowCanvas` shows modules, rates, and a visual belt animation (`flowRate` exposed on edges).
- For logic bugs, add focused unit tests using `tests/utils/mock-data.ts` to reproduce scenarios quickly in `vitest watch`.

Where to look first when triaging an issue 🕵️
- Simulation correctness: `src/engine/simulation.ts` and `tests/unit/simulation-engine.test.ts`.
- State issues: `src/store/gameStore.ts` and how `FlowCanvas` applies updates.
- UI/edge cases: `src/components/flow/FlowCanvas.tsx` and node components at `src/components/nodes/*`.

If something is unclear
- Ask for which scenario to reproduce and which data types/values to use; point to the relevant mock helper in `tests/utils/mock-data.ts` so tests can be added quickly.

---
If you'd like, I can open a draft PR that adds this file and include a short checklist template for new node types and tests. Want me to add that checklist to the file? ✍️