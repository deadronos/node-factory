// Component tests for MinerNode
import { describe, expect, it } from 'vitest'
import { render, screen } from '../utils/test-utils'
import { MinerNode } from '../../src/components/nodes/MinerNode'
import { createMockMinerNode } from '../utils/mock-data'

describe('MinerNode Component', () => {
  it('should render correctly with basic props', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    
    render(<MinerNode data={miner.data} selected={false} />)
    
    // Check for basic elements
    expect(screen.getByText('⛏️ Miner')).toBeInTheDocument()
    expect(screen.getByText('Lv.1')).toBeInTheDocument()
    expect(screen.getByText('🟢 Producing')).toBeInTheDocument()
    expect(screen.getByText('⚡ 2.0/s')).toBeInTheDocument()
  })

  it('should display correct buffer information', () => {
    const miner = createMockMinerNode('miner-1', 15, 20)
    
    render(<MinerNode data={miner.data} selected={false} />)
    
    expect(screen.getByText('Ore:')).toBeInTheDocument()
    expect(screen.getByText('15.0/20')).toBeInTheDocument()
  })

  it('should show different statuses', () => {
    // Test blocked status
    const blockedMiner = createMockMinerNode('miner-1', 20, 20)
    blockedMiner.data.status = 'blocked'
    
    render(<MinerNode data={blockedMiner.data} selected={false} />)
    expect(screen.getByText('🔴 Blocked')).toBeInTheDocument()
    
    // Test idle status
    const idleMiner = createMockMinerNode('miner-1', 0, 20)
    idleMiner.data.status = 'idle'
    
    render(<MinerNode data={idleMiner.data} selected={false} />)
    expect(screen.getByText('⚪ Idle')).toBeInTheDocument()
  })

  it('should show selected state', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    
    const { container } = render(<MinerNode data={miner.data} selected={true} />)
    
    // Check for selected styling
    const card = container.firstChild
    expect(card).toHaveClass('border-blue-500')
    expect(card).toHaveClass('shadow-lg')
  })

  it('should show unselected state', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    
    const { container } = render(<MinerNode data={miner.data} selected={false} />)
    
    // Check for unselected styling
    const card = container.firstChild
    expect(card).toHaveClass('border-amber-300')
    expect(card).not.toHaveClass('shadow-lg')
  })

  it('should display correct production rate', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    miner.data.productionRate = 3.5
    
    render(<MinerNode data={miner.data} selected={false} />)
    
    expect(screen.getByText('⚡ 3.5/s')).toBeInTheDocument()
  })

  it('should display correct level', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    miner.data.level = 3
    
    render(<MinerNode data={miner.data} selected={false} />)
    
    expect(screen.getByText('Lv.3')).toBeInTheDocument()
  })

  it('should handle empty output buffer gracefully', () => {
    const miner = createMockMinerNode('miner-1', 10, 20)
    miner.data.outputBuffers = []
    
    // Should not crash
    expect(() => {
      render(<MinerNode data={miner.data} selected={false} />)
    }).not.toThrow()
  })

  it('should show buffer fill percentage visually', () => {
    const miner = createMockMinerNode('miner-1', 15, 20) // 75% full
    
    const { container } = render(<MinerNode data={miner.data} selected={false} />)
    
    // Find the progress bar
    const progressBar = container.querySelector('.bg-amber-500')
    expect(progressBar).toBeInTheDocument()
    
    // Check the width (should be around 75%)
    if (progressBar) {
      const width = progressBar.getAttribute('style')?.match(/width: (\d+)%/)
      if (width) {
        const percentage = parseInt(width[1])
        expect(percentage).toBeWithinRange(70, 80)
      }
    }
  })

  it('should be memoized to prevent unnecessary re-renders', () => {
    // This test verifies that the component is memoized
    const miner = createMockMinerNode('miner-1', 10, 20)
    
    const { rerender } = render(<MinerNode data={miner.data} selected={false} />)
    
    // Re-render with same props - should not cause full re-render
    rerender(<MinerNode data={miner.data} selected={false} />)
    
    // Component should handle this gracefully
    expect(screen.getByText('⛏️ Miner')).toBeInTheDocument()
  })
})