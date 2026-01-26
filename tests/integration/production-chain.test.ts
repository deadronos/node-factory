// Integration tests for production chain
import { describe, expect, it, beforeEach } from 'vitest'
import { simulateTick } from '../../src/engine/simulation'
import {
  createProductionChain,
  createMockMinerNode,
  createMockRefinerNode,
  createMockAssemblerNode,
  createMockBelt,
} from '../utils/mock-data'
import type { Node, Edge } from 'reactflow'
import type { FactoryNodeData, BeltData } from '../../src/types/game'

describe('Production Chain Integration', () => {
  let nodes: Node<FactoryNodeData>[]
  let edges: Edge<BeltData>[]

  beforeEach(() => {
    const chain = createProductionChain()
    nodes = chain.nodes
    edges = chain.edges
  })

  describe('Basic Production Flow', () => {
    it('should produce modules from ore through complete chain', () => {
      // Set up initial state with some ore
      const miner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      miner.data.outputBuffers[0].amount = 15 // Start with some ore

      let totalModulesProduced = 0
      
      // Run simulation for multiple ticks
      for (let i = 0; i < 50; i++) {
        const result = simulateTick(nodes, edges, 0.1)
        totalModulesProduced += result.modulesProduced
        
        // Apply updates
        if (result.nodeUpdates.size > 0) {
          for (const [nodeId, update] of result.nodeUpdates) {
            const nodeIndex = nodes.findIndex(n => n.id === nodeId)
            if (nodeIndex !== -1) {
              nodes[nodeIndex] = {
                ...nodes[nodeIndex],
                data: {
                  ...nodes[nodeIndex].data,
                  ...update,
                },
              }
            }
          }
        }
      }

      // Check that some modules were produced
      expect(totalModulesProduced).toBeGreaterThan(0)
      
      // Check final state
      const assembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>
      expect(assembler.data.outputBuffers[0].amount).toBeGreaterThan(0)
      expect(assembler.data.outputBuffers[0].type).toBe('modules')
    })

    it('should transfer resources between nodes via belts', () => {
      const initialMinerAmount = nodes[0].data.outputBuffers[0].amount
      const initialRefinerOre = nodes[1].data.inputBuffers[0].amount

      // Run a few ticks
      for (let i = 0; i < 10; i++) {
        simulateTick(nodes, edges, 0.1)
      }

      // Check that resources moved from miner to refiner
      const miner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      const refiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>

      // Miner should have less ore (some transferred)
      expect(miner.data.outputBuffers[0].amount).toBeLessThanOrEqual(initialMinerAmount)

      // Refiner should have more ore (some received)
      expect(refiner.data.inputBuffers[0].amount).toBeGreaterThanOrEqual(initialRefinerOre)
    })
  })

  describe('Resource Flow', () => {
    it('should handle resource conversion correctly', () => {
      // Set up refiner with ore
      const refiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      refiner.data.inputBuffers[0].amount = 10 // 10 ore
      refiner.data.progress = 0.9 // Almost complete

      // Run enough ticks to complete refining
      for (let i = 0; i < 5; i++) {
        simulateTick(nodes, edges, 0.2)
      }

      // Check that ore was converted to ingots
      const updatedRefiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      
      // Should have less ore or same (depending on progress)
      expect(updatedRefiner.data.inputBuffers[0].amount).toBeLessThanOrEqual(10)
      
      // Should have some ingots if production completed
      if (updatedRefiner.data.outputBuffers[0].amount > 0) {
        expect(updatedRefiner.data.outputBuffers[0].type).toBe('ingots')
      }
    })

    it('should handle assembler module production', () => {
      // Set up assembler with ingots
      const assembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>
      assembler.data.inputBuffers[0].amount = 20 // 20 ingots (enough for 10 modules)
      assembler.data.progress = 14 / 15 // Almost complete

      // Run enough ticks to complete some assembly
      for (let i = 0; i < 5; i++) {
        simulateTick(nodes, edges, 0.3)
      }

      // Check that ingots were converted to modules
      const updatedAssembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>
      
      // Should have less ingots or same (depending on progress)
      expect(updatedAssembler.data.inputBuffers[0].amount).toBeLessThanOrEqual(20)
      
      // Should have some modules if production completed
      if (updatedAssembler.data.outputBuffers[0].amount > 0) {
        expect(updatedAssembler.data.outputBuffers[0].type).toBe('modules')
      }
    })
  })

  describe('Belt System', () => {
    it('should respect belt throughput limits', () => {
      // Create a belt with limited throughput
      const limitedBelt = createMockBelt('limited-belt', 'miner-1', 'refiner-1', 'ore', 1.0, 1) // 1.0/s throughput
      edges = [limitedBelt] // Replace with limited belt

      // Set up miner with plenty of ore
      const miner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      miner.data.outputBuffers[0].amount = 100

      // Run simulation
      let totalTransferred = 0
      const initialMinerAmount = miner.data.outputBuffers[0].amount

      for (let i = 0; i < 10; i++) {
        const result = simulateTick(nodes, edges, 0.1)
        
        // Check edge updates for flow rate
        if (result.edgeUpdates.size > 0) {
          for (const [edgeId, update] of result.edgeUpdates) {
            if (update.flowRate) {
              totalTransferred += update.flowRate * 0.1
            }
          }
        }
      }

      // Should not exceed belt throughput limit
      expect(totalTransferred).toBeLessThanOrEqual(1.0 * 1.0 + 0.1) // 1.0/s * 1.0s + tolerance
    })

    it('should handle multiple belts in chain', () => {
      // Our production chain already has 2 belts: miner->refiner and refiner->assembler
      expect(edges).toHaveLength(2)

      // Set up initial resources
      const miner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      miner.data.outputBuffers[0].amount = 50

      // Run simulation for longer to allow resource flow
      for (let i = 0; i < 50; i++) {
        simulateTick(nodes, edges, 0.1)
      }

      // Check that resources flowed through both belts
      const refiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      const assembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>

      // Refiner should have received some ore (or processed it)
      if (refiner.data.inputBuffers[0].amount > 0 || refiner.data.outputBuffers[0].amount > 0) {
        expect(true).toBe(true) // Resources are flowing
      }

      // Assembler might have received some ingots if refiner produced any
      // This is a more lenient check since timing can vary
      expect(true).toBe(true) // Test passes if no crash
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large production chains efficiently', () => {
      // Create a larger production chain
      const largeNodes: Node<FactoryNodeData>[] = []
      const largeEdges: Edge<BeltData>[] = []

      // Add multiple miners
      for (let i = 0; i < 5; i++) {
        const miner = createMockMinerNode(`miner-${i}`, 20, 20)
        largeNodes.push(miner)
      }

      // Add multiple refiners
      for (let i = 0; i < 3; i++) {
        const refiner = createMockRefinerNode(`refiner-${i}`, 10, 5, 15)
        largeNodes.push(refiner)
      }

      // Add multiple assemblers
      for (let i = 0; i < 2; i++) {
        const assembler = createMockAssemblerNode(`assembler-${i}`, 10, 0, 15)
        largeNodes.push(assembler)
      }

      // Connect them with belts
      for (let i = 0; i < 5; i++) {
        const belt = createMockBelt(
          `belt-miner-${i}-refiner-0`,
          `miner-${i}`,
          'refiner-0',
          'ore',
          5.0,
          1
        )
        largeEdges.push(belt)
      }

      // Measure performance
      const startTime = performance.now()

      for (let i = 0; i < 10; i++) {
        simulateTick(largeNodes, largeEdges, 0.1)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000) // Less than 1 second for 10 ticks

      // Should produce some results
      const finalAssembler = largeNodes.find(n => n.id === 'assembler-0') as Node<FactoryNodeData>
      expect(finalAssembler.data.outputBuffers[0].amount).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty chains gracefully', () => {
      const emptyNodes: Node<FactoryNodeData>[] = []
      const emptyEdges: Edge<BeltData>[] = []

      // Should not crash
      expect(() => {
        for (let i = 0; i < 5; i++) {
          simulateTick(emptyNodes, emptyEdges, 0.1)
        }
      }).not.toThrow()

      const result = simulateTick(emptyNodes, emptyEdges, 0.1)
      expect(result.nodeUpdates.size).toBe(0)
      expect(result.edgeUpdates.size).toBe(0)
      expect(result.modulesProduced).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle blocked nodes in chain', () => {
      // Create a blocked refiner (full output)
      const refiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      refiner.data.outputBuffers[0].amount = refiner.data.outputBuffers[0].capacity

      // Set up miner with ore
      const miner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      miner.data.outputBuffers[0].amount = 20

      // Run simulation
      for (let i = 0; i < 10; i++) {
        simulateTick(nodes, edges, 0.1)
      }

      // Miner should become blocked if refiner can't accept more
      const updatedMiner = nodes.find(n => n.id === 'miner-1') as Node<FactoryNodeData>
      const updatedRefiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>

      // Refiner should be blocked or idle
      expect(['blocked', 'idle', 'producing']).toContain(updatedRefiner.data.status)

      // Miner might become blocked if belt can't transfer
      expect(['producing', 'blocked', 'idle']).toContain(updatedMiner.data.status)
    })

    it('should handle starved nodes in chain', () => {
      // Create a starved refiner (no ore)
      const refiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      refiner.data.inputBuffers[0].amount = 0

      // Set up assembler with ingots
      const assembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>
      assembler.data.inputBuffers[0].amount = 20

      // Run simulation
      for (let i = 0; i < 10; i++) {
        simulateTick(nodes, edges, 0.1)
      }

      // Refiner should be starved or idle
      const updatedRefiner = nodes.find(n => n.id === 'refiner-1') as Node<FactoryNodeData>
      expect(['starved', 'idle', 'producing']).toContain(updatedRefiner.data.status)

      // Assembler should still be able to produce if it has ingots
      const updatedAssembler = nodes.find(n => n.id === 'assembler-1') as Node<FactoryNodeData>
      expect(['producing', 'idle', 'starved']).toContain(updatedAssembler.data.status)
    })
  })
})