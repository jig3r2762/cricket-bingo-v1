import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-4">
            <div className="text-5xl">🏏</div>
            <h1 className="text-xl font-bold text-white tracking-wider uppercase">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-sm">
              The app ran into an unexpected error. This has been noted.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400/70 bg-red-950/30 border border-red-900/30 rounded-lg p-3 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-900 transition-all"
              style={{
                background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)",
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
