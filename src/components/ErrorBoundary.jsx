import React from 'react'
import CustomCursor from '../CustomCursor.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MAINFRAME KERNEL PANIC]', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-overlay" role="alert" aria-live="assertive">
          {/* Keep custom cyberpunk cursor fully functional and animated on error screen */}
          <CustomCursor mood="breach" nativeCursor={false} cursorStyle="classic" />
          
          <div className="error-boundary-card">
            <div className="error-boundary-header">
              <span className="error-icon">⚠️</span>
              <h2>CRITICAL KERNEL PANIC // SYSTEM FAULT</h2>
            </div>
            <p className="error-message">
              Ý thức AI hoặc trình dựng 3D đã gặp sự cố không ngờ tới. Tiến trình lõi bị ngắt đột ngột.
            </p>
            <div className="error-details-box">
              <div className="error-details-title">EXCEPTION TRACE DUMP:</div>
              <pre className="error-stack">
                {this.state.error && this.state.error.toString()}
                {'\n'}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            <div className="error-actions">
              <button
                type="button"
                className="error-reboot-btn interactive"
                onClick={this.handleReset}
                aria-label="Khởi động lại hệ thống"
              >
                🔄 REBOOT MAINFRAME OS
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
