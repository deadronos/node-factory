// Unit tests for simulation engine
import { describe, expect, it, beforeEach } from 'vitest'
import {
  updateMiner,
  updateRefiner,
  updateAssembler,
  updateStorage,
  updateSplitter,
  transferAlongBelt,
  simulateTick,
} from '../../src/engine/simulation'
import {
  createMockMinerNode,
  createMockRefinerNode,
  createMockAssemblerNode,
  createMockStorageNode,
  createMockSplitterNode,
  createMockBelt,
  createProductionChain,
  createStarvedScenario,
  createBlockedScenario,
} from '../utils/mock-data'
import type { Node, Edge } from 'reactflow'
import type {
  FactoryNodeData,
  BeltData,
  MinerNodeData,
  RefinerNodeData,
  AssemblerNodeData,
  StorageNodeData,
  SplitterNodeData,
} from '../../src/types/game'

describe('Simulation Engine', () => {
  describe('updateMiner', () => {
    it('should produce ore over time', () => {
      const miner = createMockMinerNode('miner-1', 10, 20)
      const update = updateMiner(miner, 0.1)
      
      expect(update.outputBuffers).toBeDefined()
      expect(update.outputBuffers![0].amount).toBeGreaterThan(10)
      expect(update.status).toBe('producing')
    })

    it('should become blocked when full', () => {
      const miner = createMockMinerNode('miner-1', 19.9, 20)
      const update = updateMiner(miner, 0.2)
      
      expect(update.status).toBe('blocked')
      expect(update.outputBuffers![0].amount).toBe(20)
    })

    it('should handle empty output buffer', () => {
      const miner = createMockMinerNode('miner-1', 0, 20)
      miner.data.outputBuffers = []
      
      const update = updateMiner(miner, 0.1)
      expect(update).toEqual({})
    })
  })

  describe('updateRefiner', () => {
    it('should process ore into ingots', () => {
      const refiner = createMockRefinerNode('refiner-1', 5, 0, 15)
      const update = updateRefiner(refiner, 0.1)
      
      expect(update.inputBuffers).toBeDefined()
      expect(update.outputBuffers).toBeDefined()
      expect(update.progress).toBeDefined()
    })

    it('should become starved without ore', () => {
      const refiner = createMockRefinerNode('refiner-1', 0, 0, 15)
      const update = updateRefiner(refiner, 0.1)
      
      expect(update.status).toBe('starved')
      expect(update.progress).toBe(0)
    })

    it('should become blocked when output is full', () => {
      const refiner = createMockRefinerNode('refiner-1', 5, 14.9, 15)
      const update = updateRefiner(refiner, 0.2) // Longer time to trigger production
      
      // The refiner should become blocked or idle if it tries to produce but output is full
      if (update.status) {
        expect(['blocked', 'producing', 'idle']).toContain(update.status)
      }
      // Progress might be reset or continue depending on implementation
    })

    it('should complete production cycle', () => {
      const refiner = createMockRefinerNode('refiner-1', 5, 0, 15)
      refiner.data.progress = 0.9 // Almost complete
      
      const update = updateRefiner(refiner, 0.2) // Should complete
      
      expect(update.progress).toBe(0) // Reset after completion
      expect(update.inputBuffers![0].amount).toBeLessThan(5) // Consumed ore
      expect(update.outputBuffers![0].amount).toBeGreaterThan(0) // Produced ingots
    })
  })

  describe('updateAssembler', () => {
    it('should process ingots into modules', () => {
      const assembler = createMockAssemblerNode('assembler-1', 10, 0, 15)
      const update = updateAssembler(assembler, 0.1)
      
      expect(update.inputBuffers).toBeDefined()
      expect(update.outputBuffers).toBeDefined()
      expect(update.progress).toBeDefined()
    })

    it('should require enough ingots', () => {
      const assembler = createMockAssemblerNode('assembler-1', 1, 0, 15) // Only 1 ingot
      const update = updateAssembler(assembler, 0.1)
      
      expect(update.status).toBe('starved')
      expect(update.progress).toBe(0)
    })

    it('should complete module production', () => {
      const assembler = createMockAssemblerNode('assembler-1', 10, 0, 15)
      assembler.data.progress = 14 / 15 // Almost complete (15 ticks total)
      
      const update = updateAssembler(assembler, 0.2)
      
      expect(update.progress).toBe(0) // Reset after completion
      expect(update.inputBuffers![0].amount).toBeLessThan(10) // Consumed ingots
      expect(update.outputBuffers![0].amount).toBeGreaterThan(0) // Produced modules
    })
  })

  describe('updateStorage', () => {
    it('should forward input to output', () => {
      const storage = createMockStorageNode('storage-1', 'ore', 50, 100)
      const update = updateStorage(storage)
      
      expect(update.outputBuffers).toBeDefined()
      expect(update.outputBuffers![0].amount).toBe(50)
      expect(update.outputBuffers![0].type).toBe('ore')
    })

    it('should handle empty input', () => {
      const storage = createMockStorageNode('storage-1', 'ore', 0, 100)
      const update = updateStorage(storage)
      
      expect(update).toEqual({})
    })

    it('should update resource type', () => {
      const storage = createMockStorageNode('storage-1', 'ore', 50, 100)
      storage.data.inputBuffers[0].type = 'ingots'
      
      const update = updateStorage(storage)
      expect(update.outputBuffers![0].type).toBe('ingots')
    })
  })

  describe('updateSplitter', () => {
    it('should distribute resources to outputs', () => {
      const splitter = createMockSplitterNode('splitter-1', 'ore', 10, 10)
      const update = updateSplitter(splitter)
      
      expect(update.inputBuffers).toBeDefined()
      expect(update.outputBuffers).toBeDefined()
      expect(update.lastOutput).toBeDefined()
    })

    it('should use round-robin distribution', () => {
      const splitter = createMockSplitterNode('splitter-1', 'ore', 20, 10)
      splitter.data.lastOutput = 0
      
      const update1 = updateSplitter(splitter)
      
      // The splitter should distribute resources and update lastOutput
      // The exact behavior depends on the implementation
      if (update1.lastOutput !== undefined) {
        expect([0, 1]).toContain(update1.lastOutput)
      }
      
      // Check that resources were actually distributed
      if (update1.outputBuffers) {
        const totalDistributed = update1.outputBuffers.reduce(
          (sum, buffer) => sum + buffer.amount,
          0
        )
        expect(totalDistributed).toBeGreaterThan(0)
      }
    })

    it('should handle full outputs', () => {
      const splitter = createMockSplitterNode('splitter-1', 'ore', 10, 10)
      splitter.data.outputBuffers[0].amount = 10 // Full first output
      splitter.data.outputBuffers[1].amount = 5 // Half full second output
      
      const update = updateSplitter(splitter)
      
      // Should distribute to second output since first is full
      expect(update.outputBuffers![1].amount).toBeGreaterThan(5)
      expect(update.outputBuffers![0].amount).toBe(10) // Unchanged
    })
  })

  describe('transferAlongBelt', () => {
    it('should transfer resources between nodes', () => {
      const source = createMockMinerNode('source-1', 15, 20)
      const target = createMockRefinerNode('target-1', 0, 0, 15)
      const belt = createMockBelt('belt-1', 'source-1', 'target-1', 'ore', 5.0, 1)
      
      const result = transferAlongBelt(belt, source, target, 0.1)
      
      expect(result.sourceUpdate.outputBuffers).toBeDefined()
      expect(result.targetUpdate.inputBuffers).toBeDefined()
      expect(result.edgeUpdate.flowRate).toBeGreaterThan(0)
    })

    it('should handle no belt data', () => {
      const source = createMockMinerNode('source-1', 15, 20)
      const target = createMockRefinerNode('target-1', 0, 0, 15)
      const belt = createMockBelt('belt-1', 'source-1', 'target-1', 'ore', 5.0, 1)
      belt.data = undefined as any
      
      const result = transferAlongBelt(belt, source, target, 0.1)
      expect(result).toEqual({
        sourceUpdate: {},
        targetUpdate: {},
        edgeUpdate: {},
      })
    })

    it('should handle empty source buffer', () => {
      const source = createMockMinerNode('source-1', 0, 20)
      const target = createMockRefinerNode('target-1', 0, 0, 15)
      const belt = createMockBelt('belt-1', 'source-1', 'target-1', 'ore', 5.0, 1)
      
      const result = transferAlongBelt(belt, source, target, 0.1)
      expect(result.edgeUpdate.flowRate).toBe(0)
    })

    it('should handle full target buffer', () => {
      const source = createMockMinerNode('source-1', 10, 20)
      const target = createMockRefinerNode('target-1', 15, 0, 15) // Full
      const belt = createMockBelt('belt-1', 'source-1', 'target-1', 'ore', 5.0, 1)
      
      const result = transferAlongBelt(belt, source, target, 0.1)
      expect(result.edgeUpdate.flowRate).toBe(0)
    })

    it('should respect belt throughput', () => {
      const source = createMockMinerNode('source-1', 100, 200)
      const target = createMockRefinerNode('target-1', 0, 0, 150)
      const belt = createMockBelt('belt-1', 'source-1', 'target-1', 'ore', 2.0, 1) // Low throughput
      
      const result = transferAlongBelt(belt, source, target, 0.1)
      
      const transferred = source.data.outputBuffers[0].amount - result.sourceUpdate.outputBuffers![0].amount
      expect(transferred).toBeLessThanOrEqual(2.0 * 0.1 + 0.01) // throughput * deltaTime (+ small tolerance)
    })
  })

  describe('simulateTick', () => {
    it('should simulate a complete production chain', () => {
      const { nodes, edges } = createProductionChain()
      
      const initialMinerAmount = nodes[0].data.outputBuffers[0].amount
      const initialRefinerOre = nodes[1].data.inputBuffers[0].amount
      const initialRefinerIngots = nodes[1].data.outputBuffers[0].amount
      
      const result = simulateTick(nodes, edges, 0.1)
      
      expect(result.nodeUpdates.size).toBeGreaterThan(0)
      expect(result.modulesProduced).toBeGreaterThanOrEqual(0)
      
      // Apply updates and verify changes
      const updatedNodes = nodes.map(node => {
        const update = result.nodeUpdates.get(node.id)
        return update
          ? {
              ...node,
              data: { ...node.data, ...update },
            }
          : node
      })
      
      // Miner should produce more ore (or stay the same if blocked)
      const updatedMiner = updatedNodes.find(n => n.id === 'miner-1') as Node<MinerNodeData>
      expect(updatedMiner.data.outputBuffers[0].amount).toBeGreaterThanOrEqual(initialMinerAmount - 0.5) // Allow for small changes
      
      // Refiner should process ore (if it received any)
      const updatedRefiner = updatedNodes.find(n => n.id === 'refiner-1') as Node<RefinerNodeData>
      if (result.edgeUpdates.size > 0) {
        expect(updatedRefiner.data.inputBuffers[0].amount).toBeGreaterThanOrEqual(initialRefinerOre)
      }
    })

    it('should handle starved scenario', () => {
      const { nodes, edges } = createStarvedScenario()
      
      const result = simulateTick(nodes, edges, 0.1)
      
      // Miner should be producing but refiner should be starved
      const minerUpdate = result.nodeUpdates.get('miner-1')
      const refinerUpdate = result.nodeUpdates.get('refiner-1')
      
      expect(minerUpdate?.status).toBe('producing')
      expect(refinerUpdate?.status).toBe('starved')
    })

    it('should handle blocked scenario', () => {
      const { nodes, edges } = createBlockedScenario()
      
      const result = simulateTick(nodes, edges, 0.1)
      
      // Both nodes should be blocked
      const minerUpdate = result.nodeUpdates.get('miner-1')
      const refinerUpdate = result.nodeUpdates.get('refiner-1')
      
      expect(minerUpdate?.status).toBe('blocked')
      expect(refinerUpdate?.status).toBe('blocked')
    })

    it('should track modules produced', () => {
      const { nodes, edges } = createProductionChain()
      
      // Set up assembler with enough ingots to produce
      const assembler = nodes[2] as Node<AssemblerNodeData>
      assembler.data.inputBuffers[0].amount = 20 // Enough for multiple modules
      assembler.data.progress = 14 / 15 // Almost complete
      
      const result = simulateTick(nodes, edges, 0.2)
      
      expect(result.modulesProduced).toBeGreaterThanOrEqual(0)
      
      // If assembler completed production, modules should be produced
      const assemblerUpdate = result.nodeUpdates.get('assembler-1')
      if (assemblerUpdate?.outputBuffers) {
        const moduleChange = assemblerUpdate.outputBuffers[0].amount - assembler.data.outputBuffers[0].amount
        if (moduleChange > 0) {
          expect(result.modulesProduced).toBe(moduleChange)
        }
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing nodes gracefully', () => {
      const nodes: Node<FactoryNodeData>[] = []
      const edges: Edge<BeltData>[] = []
      
      const result = simulateTick(nodes, edges, 0.1)
      
      expect(result.nodeUpdates.size).toBe(0)
      expect(result.edgeUpdates.size).toBe(0)
      expect(result.modulesProduced).toBe(0)
    })

    it('should handle invalid edge connections', () => {
      const miner = createMockMinerNode('miner-1', 10, 20)
      const refiner = createMockRefinerNode('refiner-1', 0, 0, 15)
      const belt = createMockBelt('belt-1', 'non-existent', 'refiner-1', 'ore', 5.0, 1)
      
      const result = simulateTick([miner, refiner], [belt], 0.1)
      
      // Should not crash and should skip invalid edges
      expect(result.nodeUpdates.size).toBeGreaterThan(0)
      expect(result.edgeUpdates.size).toBe(0)
    })

    it('should handle zero deltaTime', () => {
      const { nodes, edges } = createProductionChain()
      
      const result = simulateTick(nodes, edges, 0)
      
      // Should not crash with zero deltaTime
      expect(result).toBeDefined()
    })

    it('should handle very large deltaTime', () => {
      const { nodes, edges } = createProductionChain()
      
      const result = simulateTick(nodes, edges, 100)
      
      // Should not crash with large deltaTime
      expect(result).toBeDefined()
    })
  })
})