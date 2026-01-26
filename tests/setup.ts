// Vitest setup file
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock React Flow for testing
vi.mock('reactflow', async () => {
  const actual = await vi.importActual('reactflow')
  return {
    ...actual,
    // Add any necessary mocks here
  }
})

// Node environment setup - no DOM needed for unit tests

// Set up global test environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Extend expect with custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(min: number, max: number): void
    toHaveClass(className: string): void
  }
}

expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range [${min}, ${max}]`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range [${min}, ${max}]`,
        pass: false,
      }
    }
  },
  toHaveClass(received: HTMLElement, className: string) {
    const pass = received.classList.contains(className)
    if (pass) {
      return {
        message: () => `expected element not to have class ${className}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to have class ${className}`,
        pass: false,
      }
    }
  },
})