import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[Feature Error Boundary: ${this.props.featureName || 'Component'}]`, error, errorInfo)
    this.setState({ errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 mx-auto max-w-2xl rounded-2xl bg-slate-950/90 border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.25)] text-slate-200 font-mono">
          <div className="flex items-center gap-3 text-rose-400 mb-2 font-bold text-base">
            <AlertCircle size={20} className="shrink-0" />
            <span>TÍNH NĂNG TẠM THỜI GIÁN ĐOẠN // {this.props.featureName || 'TÍNH NĂNG'}</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Hệ thống đã tự động cách ly tiến trình để bảo vệ toàn bộ trang web. Nhấn nút bên dưới để thử khôi phục lại tính năng này:
          </p>

          {this.state.error && (
            <div className="p-3 mb-4 rounded-xl bg-black/80 border border-rose-500/30 text-[11px] text-rose-300 overflow-x-auto">
              <div className="text-rose-400 font-bold mb-1">CHI TIẾT LỖI:</div>
              <code>{this.state.error.toString()}</code>
            </div>
          )}

          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <RefreshCw size={14} />
            <span>Khôi phục tính năng này</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
