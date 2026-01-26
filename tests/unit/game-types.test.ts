// Unit tests for game types
import { describe, expect, it } from 'vitest'
import {
  NODE_COSTS,
  BASE_RATES,
  BUFFER_CAPACITIES,
  RECIPES,
  BELT_UPGRADES,
  BASE_BELT_THROUGHPUT,
} from '../../src/types/game'

describe('Game Types - Constants and Configurations', () => {
  describe('NODE_COSTS', () => {
    it('should have correct costs for all node types', () => {
      expect(NODE_COSTS.miner.modules).toBe(10)
      expect(NODE_COSTS.refiner.modules).toBe(15)
      expect(NODE_COSTS.assembler.modules).toBe(20)
      expect(NODE_COSTS.storage.modules).toBe(5)
      expect(NODE_COSTS.splitter.modules).toBe(25)
    })

    it('should have positive costs', () => {
      Object.values(NODE_COSTS).forEach(cost => {
        expect(cost.modules).toBeGreaterThan(0)
      })
    })
  })

  describe('BASE_RATES', () => {
    it('should have correct production rates', () => {
      expect(BASE_RATES.miner).toBe(2.0)
      expect(BASE_RATES.refiner).toBe(1.5)
      expect(BASE_RATES.assembler).toBe(1.0)
      expect(BASE_RATES.storage).toBe(0)
      expect(BASE_RATES.splitter).toBe(0)
    })

    it('should have non-negative rates', () => {
      Object.values(BASE_RATES).forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('BUFFER_CAPACITIES', () => {
    it('should have correct buffer capacities', () => {
      expect(BUFFER_CAPACITIES.miner).toBe(20)
      expect(BUFFER_CAPACITIES.refiner).toBe(15)
      expect(BUFFER_CAPACITIES.assembler).toBe(15)
      expect(BUFFER_CAPACITIES.storage).toBe(100)
      expect(BUFFER_CAPACITIES.splitter).toBe(10)
    })

    it('should have positive capacities', () => {
      Object.values(BUFFER_CAPACITIES).forEach(capacity => {
        expect(capacity).toBeGreaterThan(0)
      })
    })
  })

  describe('RECIPES', () => {
    it('should have correct refiner recipe', () => {
      const refinerRecipe = RECIPES.refiner
      expect(refinerRecipe.inputs.ore).toBe(1)
      expect(refinerRecipe.inputs.ingots).toBe(0)
      expect(refinerRecipe.inputs.modules).toBe(0)
      expect(refinerRecipe.outputs.ingots).toBe(1)
      expect(refinerRecipe.outputs.ore).toBe(0)
      expect(refinerRecipe.outputs.modules).toBe(0)
      expect(refinerRecipe.processingTime).toBe(10)
    })

    it('should have correct assembler recipe', () => {
      const assemblerRecipe = RECIPES.assembler
      expect(assemblerRecipe.inputs.ingots).toBe(2)
      expect(assemblerRecipe.inputs.ore).toBe(0)
      expect(assemblerRecipe.inputs.modules).toBe(0)
      expect(assemblerRecipe.outputs.modules).toBe(1)
      expect(assemblerRecipe.outputs.ingots).toBe(0)
      expect(assemblerRecipe.outputs.ore).toBe(0)
      expect(assemblerRecipe.processingTime).toBe(15)
    })

    it('should conserve mass in recipes', () => {
      // Simple mass conservation check
      const refinerInputMass = RECIPES.refiner.inputs.ore
      const refinerOutputMass = RECIPES.refiner.outputs.ingots
      expect(refinerInputMass).toBe(refinerOutputMass)

      const assemblerInputMass = RECIPES.assembler.inputs.ingots
      const assemblerOutputMass = RECIPES.assembler.outputs.modules
      // Assembler creates 1 module from 2 ingots (some mass loss expected)
      expect(assemblerInputMass).toBeGreaterThan(assemblerOutputMass)
    })
  })

  describe('BELT_UPGRADES', () => {
    it('should have correct upgrade levels', () => {
      expect(BELT_UPGRADES).toHaveLength(3)
      expect(BELT_UPGRADES[0].level).toBe(1)
      expect(BELT_UPGRADES[1].level).toBe(2)
      expect(BELT_UPGRADES[2].level).toBe(3)
    })

    it('should have increasing throughput', () => {
      for (let i = 1; i < BELT_UPGRADES.length; i++) {
        expect(BELT_UPGRADES[i].throughput).toBeGreaterThan(
          BELT_UPGRADES[i - 1].throughput
        )
      }
    })

    it('should have increasing costs', () => {
      for (let i = 1; i < BELT_UPGRADES.length; i++) {
        expect(BELT_UPGRADES[i].cost).toBeGreaterThan(
          BELT_UPGRADES[i - 1].cost
        )
      }
    })

    it('should start with zero cost for level 1', () => {
      expect(BELT_UPGRADES[0].cost).toBe(0)
    })
  })

  describe('BASE_BELT_THROUGHPUT', () => {
    it('should match level 1 belt throughput', () => {
      expect(BASE_BELT_THROUGHPUT).toBe(BELT_UPGRADES[0].throughput)
    })

    it('should be positive', () => {
      expect(BASE_BELT_THROUGHPUT).toBeGreaterThan(0)
    })
  })

  describe('Type Safety', () => {
    it('should have consistent types', () => {
      // This test ensures TypeScript compilation works
      const nodeTypes: Array<'miner' | 'refiner' | 'assembler' | 'storage' | 'splitter'> = [
        'miner',
        'refiner',
        'assembler',
        'storage',
        'splitter',
      ]

      const resourceTypes: Array<'ore' | 'ingots' | 'modules'> = ['ore', 'ingots', 'modules']

      expect(nodeTypes).toHaveLength(5)
      expect(resourceTypes).toHaveLength(3)
    })
  })

  describe('Data Validation', () => {
    it('should have valid numerical values', () => {
      // Check that all numerical constants are valid numbers
      expect(Number.isFinite(BASE_BELT_THROUGHPUT)).toBe(true)
      
      Object.values(NODE_COSTS).forEach(cost => {
        expect(Number.isFinite(cost.modules)).toBe(true)
      })

      Object.values(BASE_RATES).forEach(rate => {
        expect(Number.isFinite(rate)).toBe(true)
      })

      Object.values(BUFFER_CAPACITIES).forEach(capacity => {
        expect(Number.isFinite(capacity)).toBe(true)
      })
    })

    it('should have non-null recipe values', () => {
      expect(RECIPES.refiner).toBeDefined()
      expect(RECIPES.assembler).toBeDefined()
      expect(RECIPES.refiner.inputs).toBeDefined()
      expect(RECIPES.refiner.outputs).toBeDefined()
    })
  })
})