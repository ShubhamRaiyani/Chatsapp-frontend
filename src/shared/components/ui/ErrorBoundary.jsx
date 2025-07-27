import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (typeof window !== "undefined") {
      console.error("ErrorBoundary caught error", error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500 text-white rounded">
          <strong>Something went wrong.</strong>
          <div className="mt-2 opacity-80 text-sm">
            {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
