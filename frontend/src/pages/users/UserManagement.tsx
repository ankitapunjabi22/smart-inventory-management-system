import { useEffect, useState } from 'react'
import { Users, Shield, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import type { User } from '../../types'

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'staff'>('staff')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/users')
      setUsers(res.data?.data?.users || [])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await api.put(`/users/${editingUser._id}/role`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/users/${deleteId}`)
      toast.success('User account removed')
      setDeleteId(null)
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const columns = [
    {
      header: 'Staff Member',
      accessor: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: (u: User) => {
        if (u.role === 'admin') return <Badge variant="danger">System Admin</Badge>
        if (u.role === 'manager') return <Badge variant="warning">Inventory Manager</Badge>
        return <Badge variant="info">Floor Staff</Badge>
      }
    },
    {
      header: 'Status',
      accessor: (u: User) => (
        <Badge variant={u.isActive ? 'success' : 'default'}>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Registration Date',
      accessor: (u: User) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A')
    },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(u)
              setNewRole(u.role)
            }}
            disabled={u._id === currentUser?._id}
            title={u._id === currentUser?._id ? 'Cannot edit own role' : 'Change permissions'}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(u._id)}
            disabled={u._id === currentUser?._id}
            title={u._id === currentUser?._id ? 'Cannot delete own account' : 'Delete user'}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & RBAC Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage personnel, role privileges and access control</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users registered in system."
        />
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Change Role: ${editingUser?.name}`}
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Access Role</label>
            <div className="space-y-2">
              {[
                { val: 'admin', label: 'Admin (Full Access)', desc: 'Can manage users, settings, products, purchases, sales and reports.' },
                { val: 'manager', label: 'Manager (Inventory Operations)', desc: 'Can create products, process purchases, receive stock and view reports.' },
                { val: 'staff', label: 'Staff (Point of Sale & Basic Operations)', desc: 'Can view inventory and process sales.' }
              ].map(opt => (
                <label
                  key={opt.val}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${newRole === opt.val ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.val}
                    checked={newRole === opt.val}
                    onChange={() => setNewRole(opt.val as any)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Update Role</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm User Account Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Are you sure you want to delete this user? Their account will be revoked immediately.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
