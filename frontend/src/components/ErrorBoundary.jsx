import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-softBg px-4 text-center">
          <h1 className="text-xl font-semibold text-primaryDark">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            {this.state.error.message || 'The page could not load. Try refreshing or clearing site data.'}
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
