import { Component, type ReactNode } from "react";

// Keeps a runtime failure inside the Baltici subtree (e.g. a data-layer error)
// from blanking the rest of the gorlium site.
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Baltici error boundary caught:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
