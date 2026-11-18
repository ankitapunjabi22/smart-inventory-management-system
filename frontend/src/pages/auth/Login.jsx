 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Boxes } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { loginUser, clearError } from '../../redux/slices/authSlice'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})



const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser({ email: data.email, password: data.password }))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex p-5 bg-blue-600 rounded-3xl shadow-2xl mb-8">
            <Boxes className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Smart Inventory</h1>
          <p className="text-blue-200 text-lg max-w-sm">
            Streamline your inventory management with real-time tracking and powerful analytics.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 text-left">
            {[
              { label: 'Products Tracked', value: '10K+' },
              { label: 'Orders Processed', value: '50K+' },
              { label: 'Revenue Managed', value: '₹5Cr+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-blue-300 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Boxes className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Smart Inventory</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-1 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                error={_optionalChain([errors, 'access', _ => _.email, 'optionalAccess', _2 => _2.message])}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                error={_optionalChain([errors, 'access', _3 => _3.password, 'optionalAccess', _4 => _4.message])}
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    {...register('rememberMe')}
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
