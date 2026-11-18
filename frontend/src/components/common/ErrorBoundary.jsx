 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { Component, } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'










export class ErrorBoundary extends Component {constructor(...args) { super(...args); ErrorBoundary.prototype.__init.call(this);ErrorBoundary.prototype.__init2.call(this); }
   __init() {this.state = {
    hasError: false,
    error: null,
  }}

   static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

   componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

   __init2() {this.handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }}

   render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4">
              An error occurred while loading this view:
            </p>
            <div className="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-red-600 mb-6 overflow-x-auto">
              {_optionalChain([this, 'access', _ => _.state, 'access', _2 => _2.error, 'optionalAccess', _3 => _3.message]) || 'Unknown render error'}
            </div>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
