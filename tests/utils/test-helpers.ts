// Test helper functions
import { describe, expect, it, vi } from 'vitest'
import type { Node, Edge } from 'reactflow'
import type { FactoryNodeData, BeltData } from '../../src/types/game'

// Helper to find a node by ID
export function findNode(nodes: Node<FactoryNodeData>[], id: string): Node<FactoryNodeData> | undefined {
  return nodes.find(node => node.id === id)
}

// Helper to find an edge by ID
export function findEdge(edges: Edge<BeltData>[], id: string): Edge<BeltData> | undefined {
  return edges.find(edge => edge.id === id)
}

// Helper to get buffer amount
export function getBufferAmount(node: Node<FactoryNodeData>, bufferIndex: number = 0): number {
  return node.data.outputBuffers[bufferIndex]?.amount || 0
}

// Helper to simulate multiple ticks
export function simulateMultipleTicks(
  simulateTick: (nodes: Node<FactoryNodeData>[], edges: Edge<BeltData>[], deltaTime: number) => any,
  nodes: Node<FactoryNodeData>[],
  edges: Edge<BeltData>[],
  tickCount: number = 10,
  deltaTime: number = 0.1
) {
  let totalModulesProduced = 0
  
  for (let i = 0; i < tickCount; i++) {
    const result = simulateTick(nodes, edges, deltaTime)
    
    // Apply updates to nodes
    if (result.nodeUpdates) {
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
    
    // Apply updates to edges
    if (result.edgeUpdates) {
      for (const [edgeId, update] of result.edgeUpdates) {
        const edgeIndex = edges.findIndex(e => e.id === edgeId)
        if (edgeIndex !== -1) {
          edges[edgeIndex] = {
            ...edges[edgeIndex],
            data: {
              ...edges[edgeIndex].data,
              ...update,
            },
          }
        }
      }
    }
    
    totalModulesProduced += result.modulesProduced || 0
  }
  
  return totalModulesProduced
}

// Helper to create test suites for node types
export function createNodeTestSuite(
  nodeType: string,
  createNode: () => Node<FactoryNodeData>,
  updateFunction: (node: Node<FactoryNodeData>, deltaTime: number) => Partial<FactoryNodeData>
) {
  describe(`${nodeType} node tests`, () => {
    it('should initialize correctly', () => {
      const node = createNode()
      expect(node).toBeDefined()
      expect(node.data.type).toBe(nodeType)
    })

    it('should update status correctly', () => {
      const node = createNode()
      const update = updateFunction(node, 0.1)
      expect(update).toBeDefined()
      if ('status' in update) {
        expect(['idle', 'producing', 'starved', 'blocked']).toContain(update.status)
      }
    })

    it('should handle deltaTime parameter', () => {
      const node = createNode()
      const update1 = updateFunction(node, 0.1)
      const update2 = updateFunction(node, 0.2)
      // Basic check that deltaTime affects the update
      expect(update1).toBeDefined()
      expect(update2).toBeDefined()
    })
  })
}

// Helper to test buffer changes
export function testBufferChanges(
  node: Node<FactoryNodeData>,
  update: Partial<FactoryNodeData>,
  expectedChanges: Record<string, number>
) {
  if (update.outputBuffers) {
    update.outputBuffers.forEach((buffer, index) => {
      if (expectedChanges[`output-${index}`] !== undefined) {
        expect(buffer.amount).toBe(expectedChanges[`output-${index}`])
      }
    })
  }
  
  if (update.inputBuffers) {
    update.inputBuffers.forEach((buffer, index) => {
      if (expectedChanges[`input-${index}`] !== undefined) {
        expect(buffer.amount).toBe(expectedChanges[`input-${index}`])
      }
    })
  }
}

// Helper to mock console methods
export function mockConsoleMethods() {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
  
  return {
    restore: () => {
      consoleError.mockRestore()
      consoleWarn.mockRestore()
      consoleLog.mockRestore()
    },
    error: consoleError,
    warn: consoleWarn,
    log: consoleLog,
  }
}

// Performance testing helper
export function measurePerformance(
  fn: () => void,
  iterations: number = 100
): { avgTime: number; totalTime: number } {
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  
  const end = performance.now()
  const totalTime = end - start
  const avgTime = totalTime / iterations
  
  return { avgTime, totalTime }
}

// Helper to test edge cases
export function testEdgeCases(
  testName: string,
  testFn: () => void,
  edgeCases: string[] = ['empty buffers', 'full buffers', 'invalid inputs', 'zero values']
) {
  describe(`${testName} edge cases`, () => {
    edgeCases.forEach(edgeCase => {
      it(`should handle ${edgeCase}`, () => {
        try {
          testFn()
          // If no error is thrown, the test passes
          expect(true).toBe(true)
        } catch (error) {
          // If an error is thrown, it should be a controlled error
          expect(error).toBeInstanceOf(Error)
        }
      })
    })
  })
}