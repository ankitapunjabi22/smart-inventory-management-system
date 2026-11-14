import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../../redux/slices/supplierSlice'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import type { Supplier } from '../../types'

export default function Suppliers() {
  const dispatch = useAppDispatch()
  const { suppliers, isLoading } = useAppSelector(state => state.suppliers)
  const { user } = useAppSelector(state => state.auth)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    gstNumber: '',
    address: ''
  })

  useEffect(() => {
    dispatch(fetchSuppliers({}))
  }, [dispatch])

  const openCreateModal = () => {
    setEditingSupplier(null)
    setForm({ name: '', companyName: '', email: '', phone: '', gstNumber: '', address: '' })
    setModalOpen(true)
  }

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup)
    setForm({
      name: sup.name,
      companyName: (sup as any).companyName || sup.company || '',
      email: sup.email,
      phone: sup.phone || '',
      gstNumber: (sup as any).gstNumber || '',
      address: typeof sup.address === 'string' ? sup.address : ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error('Supplier name and email are required')
      return
    }

    try {
      if (editingSupplier) {
        await dispatch(updateSupplier({ id: editingSupplier._id, data: form })).unwrap()
        toast.success('Supplier updated successfully')
      } else {
        await dispatch(createSupplier(form)).unwrap()
        toast.success('Supplier created successfully')
      }
      setModalOpen(false)
      dispatch(fetchSuppliers({}))
    } catch (err: any) {
      toast.error(err || 'Action failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await dispatch(deleteSupplier(deleteId)).unwrap()
      toast.success('Supplier deleted')
      setDeleteId(null)
      dispatch(fetchSuppliers({}))
    } catch (err: any) {
      toast.error(err || 'Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    ((s as any).companyName || s.company || '').toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Supplier & Company',
      accessor: (s: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{s.name}</p>
            <p className="text-xs text-slate-400">{(s as any).companyName || s.company || 'Individual Vendor'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (s: Supplier) => (
        <div className="space-y-1 text-xs">
          <p className="flex items-center gap-1.5 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email}
          </p>
          {s.phone && (
            <p className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'GST / Tax ID',
      accessor: (s: Supplier) => (
        <span className="font-mono text-xs text-slate-600">{(s as any).gstNumber || 'N/A'}</span>
      )
    },
    {
      header: 'Status',
      accessor: (s: Supplier) => (
        <Badge variant={s.isActive !== false ? 'success' : 'default'}>
          {s.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (s: Supplier) => (
        <div className="flex items-center gap-2">
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => openEditModal(s)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => setDeleteId(s._id)}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor contacts, procurement channels and agreements</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button variant="primary" onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" /> Add Supplier
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, company or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={filteredSuppliers}
          isLoading={isLoading}
          emptyMessage="No suppliers registered yet."
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              required
            />
            <Input
              label="Company Name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Global Tech Distributors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. sales@vendor.com"
              required
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
          </div>

          <Input
            label="GSTIN / Tax ID"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            placeholder="e.g. 29ABCDE1234F1Z5"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, Industrial Area, City..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Cannot delete supplier if active products are associated with it.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Supplier</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
