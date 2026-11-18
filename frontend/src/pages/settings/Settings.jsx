import { useState } from 'react'
import { Sliders, Globe, Save } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

export default function Settings() {
  const [currency, setCurrency] = useState('₹ (INR)')
  const [lowStockThreshold, setLowStockThreshold] = useState('10')
  const [companyName, setCompanyName] = useState('Smart Inventory Pvt Ltd')
  const [alertEmail, setAlertEmail] = useState('admin@inventory.com')
  const [autoEmailAlerts, setAutoEmailAlerts] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('System preferences saved successfully!')
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure global inventory defaults, notifications, and company profile</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company & General Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Organization Settings</h2>
              <p className="text-xs text-slate-400">Company identity displayed on invoices & reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization / Business Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Standard Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="₹ (INR)">₹ — Indian Rupee (INR)</option>
                <option value="$ (USD)">$ — US Dollar (USD)</option>
                <option value="€ (EUR)">€ — Euro (EUR)</option>
                <option value="£ (GBP)">£ — British Pound (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Automation Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Inventory Automation Rules</h2>
              <p className="text-xs text-slate-400">Thresholds for real-time warehouse alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Low Stock Threshold (Units)"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="e.g. 10"
              required
            />
            <Input
              label="Warehouse Operations Alert Email"
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="alerts@company.com"
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEmailAlerts}
                onChange={(e) => setAutoEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 font-medium">
                Broadcast real-time WebSocket alerts to all logged-in managers when stock falls below threshold
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isSaving} className="gap-2 px-6">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
