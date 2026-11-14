import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Tag, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../redux/slices/categorySlice'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import type { Category } from '../../types'

export default function Categories() {
  const dispatch = useAppDispatch()
  const { categories, isLoading } = useAppSelector(state => state.categories)
  const { user } = useAppSelector(state => state.auth)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '', color: '#3b82f6' })
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      description: cat.description || '',
      color: (cat as any).color || '#3b82f6'
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, data: formData })).unwrap()
        toast.success('Category updated successfully')
      } else {
        await dispatch(createCategory(formData)).unwrap()
        toast.success('Category created successfully')
      }
      setModalOpen(false)
      dispatch(fetchCategories())
    } catch (err: any) {
      toast.error(err || 'Action failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await dispatch(deleteCategory(deleteId)).unwrap()
      toast.success('Category deleted')
      setDeleteId(null)
      dispatch(fetchCategories())
    } catch (err: any) {
      toast.error(err || 'Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  const columns = [
    {
      header: 'Category Name',
      accessor: (cat: Category) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: (cat as any).color || '#3b82f6' }}
          >
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{cat.name}</p>
            <p className="text-xs text-slate-400">{cat.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Associated Products',
      accessor: (cat: Category) => (
        <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
          {cat.productCount || 0} items
        </span>
      )
    },
    {
      header: 'Created Date',
      accessor: (cat: Category) =>
        cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Actions',
      accessor: (cat: Category) => (
        <div className="flex items-center gap-2">
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => openEditModal(cat)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => setDeleteId(cat._id)}
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
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Organize products into classification groups</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button variant="primary" onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          emptyMessage="No categories found."
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Consumer Electronics"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of items in this category..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
              />
              <span className="text-xs text-slate-500 font-mono">{formData.color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingCategory ? 'Save Changes' : 'Create Category'}
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
            <p className="text-sm">Cannot delete category if products are assigned to it.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
