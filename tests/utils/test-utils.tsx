// React testing utilities
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { ReactFlowProvider } from "reactflow";

// Custom render function that wraps components in providers
function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  // Add any providers here (e.g., game store, theme provider)
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <ReactFlowProvider>{children}</ReactFlowProvider>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { render };
