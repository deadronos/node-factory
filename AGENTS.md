# AGENTS.md — Agent guide for node-factory 🤖


## Project overview

- node-factory is a small React + TypeScript + Vite game prototype: a factory simulation with nodes (miners, refiners, assemblers, storage, splitters) connected by belts (edges) that transport resources.
- Key libraries: React, TypeScript (strict), Vite, React Flow (visual graph), Zustand (store), Vitest (tests), ESLint + Prettier.


## Required setup (quick) ✅

- Install dependencies: `pnpm install`
- Start dev server (live-reload): `pnpm dev` → open the app in the browser
- Build (type-check + Vite build): `pnpm build`
- Lint: `pnpm lint`


## Test commands

- Run all tests: `pnpm test` (Vitest)
- Run unit tests: `pnpm test:unit`
- Run component tests: `pnpm test:component`
- Run integration tests: `pnpm test:integration`
- Watch mode for development: `pnpm test:watch`
- Run a single test by name: `pnpm vitest run -t "<test name>"` or point at a file: `pnpm vitest run tests/unit/simulation-engine.test.ts`
- Coverage: `pnpm test:coverage`


## High-level architecture (what agents need to know) 🔧

- Engine (pure simulation): `src/engine/*` — contains `simulateTick`, `transferAlongBelt`, and node update functions (`updateMiner`, `updateRefiner`, `updateAssembler`, `updateStorage`, `updateSplitter`). These functions are pure and **return Partial updates** for nodes/edges rather than mutating inputs.
- Types & rules: `src/types/game.ts` — single source of truth for domain types, constants (rates, capacities, recipes, belt upgrades).
- State/store: `src/store/gameStore.ts` (Zustand) — holds `nodes`, `edges`, `economy`, `research`, `goals`, tick controls and provides actions (`setNodes`, `updateNodeData`, `addEdge`, etc.).
- UI: `src/components/flow/FlowCanvas.tsx` wires state → simulation loop → rendering via ReactFlow. Node components live in `src/components/nodes/*`.


## Project-specific conventions & patterns 📐

- Engine functions never mutate input nodes/edges. They return a `Partial<...>` that callers merge into state (see `FlowCanvas` application pattern).
- Buffers: nodes have `inputBuffers` and `outputBuffers` arrays of `ResourceBuffer`; most code uses index 0 but `splitter` uses multiple outputs.
- Belt semantics: `Edge.data` uses `BeltData` = `{ resourceType: ResourceType | null, throughput, level, flowRate }`. `resourceType` can be `null` and is inferred from the source node when transferring.
- Tick timing: engine uses `TICK_DELTA = 0.1` (10 ticks/sec); `FlowCanvas` runs an interval at `100ms` to call `simulateTick` with `deltaTime = 0.1`.
- Node status values: `'idle' | 'producing' | 'starved' | 'blocked'` — tests assert these strings.
- Tests use `tests/utils/mock-data.ts` to create nodes/belts and test scenarios. Add helpers there when adding new node types.


## How to add a new node type (concise checklist) ⚙️

1. Add new type to `NodeType` in `src/types/game.ts`. Add any needed constants (costs, base rates, buffer capacities, recipes).
2. Extend domain types (if required) in `src/types/game.ts`.
3. Implement factory creation in `src/engine/nodeFactory.ts` (return initial `FactoryNodeData`).
4. Add update logic in `src/engine/simulation.ts` as `update<YourNode>()` and wire into `simulateTick`.
5. Add UI node component: `src/components/nodes/<YourNode>Node.tsx` and register it in `FlowCanvas` `nodeTypes` mapping.
6. Add unit tests (engine logic) to `tests/unit/simulation-engine.test.ts` and add mock helper(s) to `tests/utils/mock-data.ts`. Add component/integration tests as appropriate.
7. Run `pnpm test` and `pnpm lint` until green.


## Testing guidance for agents ✅

- Prefer focused unit tests for engine logic (simulate single tick, edge transfer, edge cases like empty buffers or full outputs).
- Use helpers in `tests/utils/mock-data.ts` (e.g., `createMockMinerNode`, `createProductionChain`, `createStarvedScenario`).
- When asserting numeric transfers, allow a small tolerance when asserting floating point/time-based behavior.
- For integration behavior, use `createProductionChain()` and call `simulateTick` a few times or use `FlowCanvas` scenarios in component tests.


## Debugging & triage tips 🕵️

- Reproduce simulation locally with `pnpm dev` and open the page — `FlowCanvas` shows modules, modules/sec, and animated belts (flowRate).
- To inspect engine behavior in isolation, write tests that call `simulateTick()` directly using mock nodes/edges.
- Typical places to investigate for logic bugs: `src/engine/simulation.ts`, `src/store/gameStore.ts`, and `src/components/flow/FlowCanvas.tsx` (merging updates and tick loop).


## Code style & pre-PR checks

- TypeScript strict mode is enabled — keep types precise. Use `src/types/game.ts` types everywhere.
- Lint + format: `pnpm lint` (ESLint + Prettier). Run before opening PRs.
- Build step includes `tsc -b` (type-check) — `pnpm build` runs both type-check and `vite build`.


## PR checklist for agents (minimal) ✅

- [ ] Add/extend unit tests for any logical changes (engine tests for simulation logic).
- [ ] Update or add mock helpers in `tests/utils/mock-data.ts` when necessary.
- [ ] Update `src/types/game.ts` for domain-level changes.
- [ ] Update `src/engine/nodeFactory.ts` & `src/engine/simulation.ts` accordingly.
- [ ] Add UI node component and register in `FlowCanvas` if a new node is required.
- [ ] Run `pnpm lint` and `pnpm test` locally; fix failures.
- [ ] Add concise test that fails before change and passes after.


## CI & deployment notes

- No `.github/workflows` found in this repository (no CI discovered). Agents must run tests and lint locally before pushing.


## Useful files (start here) 📂

- Simulation & engine: `src/engine/simulation.ts`, `src/engine/nodeFactory.ts`
- Types & domain constants: `src/types/game.ts`
- Store & state management: `src/store/gameStore.ts`
- UI & tick loop: `src/components/flow/FlowCanvas.tsx`
- Node components: `src/components/nodes/*`
- Test helpers: `tests/utils/mock-data.ts`
- Tests: `tests/unit`, `tests/component`, `tests/integration`


---

If you'd like, I can also:

- Add `AGENTS.md` snippets to the repo's root README, or
- Open a draft PR that includes a **PR checklist** template file and a small contributor note.

Tell me which option you prefer and I'll proceed. ✍️
