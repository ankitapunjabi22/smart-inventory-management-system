 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logoutUser } from '../../redux/slices/authSlice'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'





const routeTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/add': 'Add Product',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/inventory': 'Inventory',
  '/purchases': 'Purchase Orders',
  '/purchases/add': 'Create Purchase',
  '/sales': 'Sales',
  '/sales/add': 'Create Sale',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/users': 'User Management',
  '/profile': 'User Profile',
  '/settings': 'System Settings',
}

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const unreadCount = useAppSelector(state => state.notifications.unreadCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const pageTitle = _optionalChain([Object, 'access', _ => _.entries, 'call', _2 => _2(routeTitles), 'access', _3 => _3.find, 'call', _4 => _4(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  ), 'optionalAccess', _5 => _5[1]]) || 'Dashboard'

  const handleLogout = async () => {
    setDropdownOpen(false)
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {_optionalChain([user, 'optionalAccess', _6 => _6.name, 'optionalAccess', _7 => _7.charAt, 'call', _8 => _8(0), 'access', _9 => _9.toUpperCase, 'call', _10 => _10()]) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-none">{_optionalChain([user, 'optionalAccess', _11 => _11.name])}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{_optionalChain([user, 'optionalAccess', _12 => _12.role])}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{_optionalChain([user, 'optionalAccess', _13 => _13.name])}</p>
                  <p className="text-xs text-slate-500 truncate">{_optionalChain([user, 'optionalAccess', _14 => _14.email])}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  Settings
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
