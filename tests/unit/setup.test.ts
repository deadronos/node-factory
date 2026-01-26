// Basic setup test to verify testing environment
import { describe, expect, it } from 'vitest'

describe('Testing Environment Setup', () => {
  it('should have Vitest working', () => {
    expect(true).toBe(true)
  })

  it('should support basic assertions', () => {
    const value = 42
    expect(value).toBe(42)
    expect(value).toBeGreaterThan(40)
    expect(value).toBeLessThan(50)
  })

  it('should support TypeScript types', () => {
    interface TestInterface {
      name: string
      value: number
    }

    const testObj: TestInterface = {
      name: 'test',
      value: 123,
    }

    expect(testObj.name).toBe('test')
    expect(testObj.value).toBe(123)
  })

  it('should support custom matchers', () => {
    const value = 50
    expect(value).toBeWithinRange(40, 60)
  })

  it('should have access to test utilities', () => {
    // This test verifies that our test setup is working
    const mockData = { test: 'data' }
    expect(mockData).toBeDefined()
    expect(mockData.test).toBe('data')
  })
})