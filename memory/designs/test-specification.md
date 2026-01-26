# Node Factory Test Specification

## Overview
This document outlines the test strategy and specifications for the Node Factory game using Vitest.

## Test Categories

### 1. Unit Tests
**Scope**: Core business logic and utility functions
**Location**: `tests/unit/`

#### Components to Test:
- **Game Types** (`src/types/game.ts`)
  - Resource type definitions
  - Node data structures
  - Recipe calculations
  - Cost structures

- **Simulation Engine** (`src/engine/simulation.ts`)
  - Individual node update functions (miner, refiner, assembler, storage, splitter)
  - Belt transfer logic
  - Main simulation tick function
  - Resource flow calculations

- **Game Store** (`src/store/gameStore.ts`)
  - State management functions
  - Action creators
  - Economy calculations
  - Research/goal tracking

### 2. Component Tests
**Scope**: React component rendering and behavior
**Location**: `tests/component/`

#### Components to Test:
- **Node Components**
  - `MinerNode.tsx` - rendering, status display, buffer visualization
  - `RefinerNode.tsx` - recipe display, progress tracking
  - `AssemblerNode.tsx` - input/output visualization
  - `StorageNode.tsx` - resource storage display
  - `SplitterNode.tsx` - distribution logic visualization

- **UI Components**
  - `NodePalette.tsx` - node selection and creation
  - `FlowCanvas.tsx` - main game canvas
  - `ResearchPanel.tsx` - research tree display
  - `EdgeUpgradePanel.tsx` - belt upgrade interface

### 3. Integration Tests
**Scope**: System interactions and workflows
**Location**: `tests/integration/`

#### Scenarios to Test:
- **Basic Production Chain**: Miner → Refiner → Assembler
- **Resource Distribution**: Splitter behavior with multiple outputs
- **Storage Integration**: Buffer management with storage nodes
- **Belt Upgrades**: Throughput changes and resource flow
- **Economy System**: Module production and spending
- **Goal Tracking**: Progress updates and completion

## Test Coverage Goals

### Unit Tests (80-90% coverage)
- All simulation functions should be tested
- Edge cases for resource calculations
- Error handling for invalid states
- Performance characteristics

### Component Tests (70-80% coverage)
- Rendering with different props
- User interaction scenarios
- Visual state changes
- Error boundary testing

### Integration Tests (60-70% coverage)
- End-to-end production flows
- Complex node interactions
- Performance under load
- Memory management

## Test Data Strategy

### Mock Data Patterns
```typescript
// Example mock node
const mockMinerNode: Node<MinerNodeData> = {
  id: 'miner-1',
  type: 'custom',
  position: { x: 0, y: 0 },
  data: {
    type: 'miner',
    status: 'producing',
    outputBuffers: [{
      type: 'ore',
      amount: 10,
      capacity: 20
    }],
    inputBuffers: [],
    productionRate: 2.0,
    level: 1
  }
};
```

### Test Utilities
- `test-utils.tsx` - React testing utilities
- `mock-data.ts` - Common test data patterns
- `test-helpers.ts` - Custom matchers and utilities

## Testing Approach

### Unit Testing Strategy
1. **Isolation**: Test each function independently
2. **Pure Functions**: Focus on input/output relationships
3. **Edge Cases**: Test boundary conditions
4. **Performance**: Verify computational complexity

### Component Testing Strategy
1. **Shallow Rendering**: Test components in isolation
2. **Prop Variations**: Test different input combinations
3. **Interaction Testing**: Simulate user actions
4. **Snapshot Testing**: Visual regression prevention

### Integration Testing Strategy
1. **Scenario-Based**: Test complete workflows
2. **State Management**: Verify store interactions
3. **Performance Testing**: Measure system behavior
4. **Error Recovery**: Test failure modes

## Test Execution Strategy

### Test Runners
- **Unit/Component**: Vitest with happy-dom
- **Integration**: Vitest with full DOM
- **CI/CD**: Run on push/pull request

### Test Environment
- **Node Version**: Current LTS
- **Browser**: Headless Chrome
- **Coverage**: Istanbul/Istanbul

## Quality Gates

### Minimum Requirements
- **Unit Tests**: 80% coverage required
- **Component Tests**: 70% coverage required  
- **Integration Tests**: 60% coverage required
- **Build Pipeline**: Tests must pass for merge

### Performance Targets
- **Unit Tests**: < 500ms per test
- **Component Tests**: < 1s per test
- **Integration Tests**: < 3s per test
- **Full Suite**: < 30s total

## Test Maintenance

### Versioning
- Tests follow semantic versioning
- Test updates with feature changes
- Deprecation warnings for breaking changes

### Documentation
- Test purpose in comments
- Complex scenarios documented
- Performance benchmarks tracked

This specification provides the foundation for comprehensive testing of the Node Factory game, ensuring reliability, performance, and maintainability.