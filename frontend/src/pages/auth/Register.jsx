 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Boxes } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { registerUser, clearError } from '../../redux/slices/authSlice'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})



const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector(state => state.auth)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser({ name: data.name, email: data.email, password: data.password }))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please log in.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Boxes className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Smart Inventory</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
            <p className="text-slate-500 mt-1 text-sm">Join Smart Inventory Management</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
              leftIcon={<User className="w-4 h-4" />}
              error={_optionalChain([errors, 'access', _ => _.name, 'optionalAccess', _2 => _2.message])}
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              error={_optionalChain([errors, 'access', _3 => _3.email, 'optionalAccess', _4 => _4.message])}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              error={_optionalChain([errors, 'access', _5 => _5.password, 'optionalAccess', _6 => _6.message])}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              error={_optionalChain([errors, 'access', _7 => _7.confirmPassword, 'optionalAccess', _8 => _8.message])}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
