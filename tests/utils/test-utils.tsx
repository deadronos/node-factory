// React testing utilities
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

// Custom render function that wraps components in providers
function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  // Add any providers here (e.g., game store, theme provider)
  const Wrapper = ({ children }: { children: ReactElement }) => {
    return (
      // Add MemoryRouter or other providers as needed
      <>{children}</>
    )
  }
  
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { render }