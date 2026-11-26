import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    let display = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
      if (parsed.error) {
        display = `Sync error (${parsed.operationType || 'read'}): ${parsed.error}`;
      }
    } catch {
      // plain error string
    }
    return { hasError: true, message: display };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Highway Craft UK ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Something interrupted the session</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{this.state.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="w-full py-2.5 bg-[#0B4F8A] hover:bg-[#093E6E] text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Highway Craft UK
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
