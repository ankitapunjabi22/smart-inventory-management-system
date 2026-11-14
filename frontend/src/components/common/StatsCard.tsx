import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  prefix?: string
  suffix?: string
}

const colorConfig = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-600', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600' },
}

const StatsCard = ({ title, value, icon, trend, trendLabel, color = 'blue', prefix, suffix }: StatsCardProps) => {
  const c = colorConfig[color]
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <div className={`${c.text}`}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
        {trendLabel && <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  )
}

export default StatsCard
