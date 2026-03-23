import { describe, expect, it } from 'vitest'
import { updateStorage } from '../../src/engine/simulation'
import { createMockStorageNode } from '../utils/mock-data'

describe('Storage Node Fix', () => {
  it('should move resources from input to output and decrease input amount', () => {
    const storage = createMockStorageNode('storage-1', 'ore', 50, 100)
    // In createMockStorageNode, it might set both input and output to the same amount
    // because that was the old buggy behavior. Let's force a clean state.
    storage.data.inputBuffers[0].amount = 50
    storage.data.outputBuffers[0].amount = 0

    const update = updateStorage(storage)

    expect(update.inputBuffers).toBeDefined()
    expect(update.outputBuffers).toBeDefined()
    expect(update.inputBuffers![0].amount).toBe(0)
    expect(update.outputBuffers![0].amount).toBe(50)
  })

  it('should not duplicate resources (total amount remains constant)', () => {
    const storage = createMockStorageNode('storage-1', 'ore', 50, 100)
    storage.data.inputBuffers[0].amount = 30
    storage.data.outputBuffers[0].amount = 20

    const initialTotal = storage.data.inputBuffers[0].amount + storage.data.outputBuffers[0].amount

    const update = updateStorage(storage)

    const newTotal = (update.inputBuffers ? update.inputBuffers[0].amount : storage.data.inputBuffers[0].amount) +
                     (update.outputBuffers ? update.outputBuffers[0].amount : storage.data.outputBuffers[0].amount)

    expect(newTotal).toBe(initialTotal)
  })

  it('should respect output capacity', () => {
    const storage = createMockStorageNode('storage-1', 'ore', 50, 100)
    storage.data.inputBuffers[0].amount = 80
    storage.data.outputBuffers[0].amount = 40
    storage.data.outputBuffers[0].capacity = 100

    const update = updateStorage(storage)

    expect(update.outputBuffers![0].amount).toBe(100)
    expect(update.inputBuffers![0].amount).toBe(20) // 80 - (100 - 40) = 20
  })
})
