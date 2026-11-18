 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from 'react'
import { User, Shield, KeyRound, Calendar, } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAppDispatch } from '../../redux/hooks'
import { fetchCurrentUser } from '../../redux/slices/authSlice'
import api from '../../services/api'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const [name, setName] = useState(_optionalChain([user, 'optionalAccess', _ => _.name]) || '')
  const [email, setEmail] = useState(_optionalChain([user, 'optionalAccess', _2 => _2.email]) || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    try {
      setIsUpdatingProfile(true)
      await api.put('/users/profile', { name, email })
      toast.success('Profile details updated successfully')
      dispatch(fetchCurrentUser())
    } catch (err) {
      toast.error(_optionalChain([err, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.message]) || 'Failed to update profile')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all password fields')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    try {
      setIsChangingPassword(true)
      await api.put('/users/change-password', { currentPassword, newPassword })
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(_optionalChain([err, 'access', _6 => _6.response, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.message]) || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          {_optionalChain([user, 'optionalAccess', _9 => _9.name, 'optionalAccess', _10 => _10.charAt, 'call', _11 => _11(0), 'access', _12 => _12.toUpperCase, 'call', _13 => _13()]) || 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{_optionalChain([user, 'optionalAccess', _14 => _14.name])}</h1>
            <Badge variant={_optionalChain([user, 'optionalAccess', _15 => _15.role]) === 'admin' ? 'info' : _optionalChain([user, 'optionalAccess', _16 => _16.role]) === 'manager' ? 'warning' : 'default'}>
              {_optionalChain([user, 'optionalAccess', _17 => _17.role, 'optionalAccess', _18 => _18.toUpperCase, 'call', _19 => _19()]) || 'STAFF'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{_optionalChain([user, 'optionalAccess', _20 => _20.email])}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-3">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Account Active
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined {_optionalChain([user, 'optionalAccess', _21 => _21.createdAt]) ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Personal Details</h2>
              <p className="text-xs text-slate-400">Update your account name and email</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User Role</label>
              <input
                type="text"
                value={_optionalChain([user, 'optionalAccess', _22 => _22.role, 'optionalAccess', _23 => _23.toUpperCase, 'call', _24 => _24()]) || 'STAFF'}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Role assignments can only be modified by System Administrators.</p>
            </div>

            <Button type="submit" loading={isUpdatingProfile} className="w-full mt-2">
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Security & Password</h2>
              <p className="text-xs text-slate-400">Change your secret login credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />

            <Button type="submit" variant="secondary" loading={isChangingPassword} className="w-full mt-2">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
