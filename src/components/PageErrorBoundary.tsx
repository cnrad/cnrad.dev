import { Component, type ReactNode } from "react";
import { ErrorModal } from "./ErrorModal";

type Props = {
  children: ReactNode;
  /**
   * When this changes (the Layout passes the current pathname), a caught error
   * is cleared so navigating away lets the next page render. React error
   * boundaries can't reset themselves, so we key the reset off the route.
   */
  resetKey?: string;
};

type State = { error: Error | null };

/**
 * Catches render errors from the page content it wraps and, instead of tearing
 * down the whole app, shows ErrorModal on top while the surrounding site chrome
 * stays mounted. Only render-time errors in page components reach here; loader
 * and layout errors bubble past to the router's errorElement (RouteErrorFallback).
 */
export class PageErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override render() {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorModal
          message={error.message}
          resetErrorBoundary={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
