import React from 'react'
import { PackageOpen } from 'lucide-react'
import Button from './Button'











const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400">
        {icon || <PackageOpen className="w-10 h-10" />}
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
