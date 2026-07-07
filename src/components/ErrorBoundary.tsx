import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render-time errors anywhere in the component tree below it and
 * shows a recoverable fallback instead of a blank white screen — critical
 * for a stadium-floor tool where fans won't file a bug report, they'll just
 * give up on the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('StadiumSense crashed:', error, errorInfo.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>StadiumSense hit an unexpected error. You can try again below.</p>
          <button type="button" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
