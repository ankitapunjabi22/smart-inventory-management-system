 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Truck, Warehouse, ShoppingCart,
  TrendingUp, BarChart3, Bell,
  Users, Settings, LogOut, X, Boxes
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logoutUser } from '../../redux/slices/authSlice'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'






const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const unreadCount = useAppSelector(state => state.notifications.unreadCount)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
     ${isActive
      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-[#1e3a5f] shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Smart</p>
              <p className="text-blue-300 text-xs font-medium">Inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClasses} onClick={() => onClose()}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}

          {/* Notifications with badge */}
          <NavLink to="/notifications" className={linkClasses} onClick={() => onClose()}>
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Admin only */}
          {_optionalChain([user, 'optionalAccess', _ => _.role]) === 'admin' && (
            <NavLink to="/users" className={linkClasses} onClick={() => onClose()}>
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>User Management</span>
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => onClose()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
              {_optionalChain([user, 'optionalAccess', _2 => _2.name, 'optionalAccess', _3 => _3.charAt, 'call', _4 => _4(0), 'access', _5 => _5.toUpperCase, 'call', _6 => _6()]) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{_optionalChain([user, 'optionalAccess', _7 => _7.name])}</p>
              <p className="text-slate-400 text-xs capitalize">{_optionalChain([user, 'optionalAccess', _8 => _8.role])}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
