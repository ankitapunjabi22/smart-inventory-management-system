import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The requested resource or page does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
