import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

const Pagination = ({ page, pages, total, limit, onPageChange }: PaginationProps) => {
  if (pages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPageNumbers = () => {
    const nums: (number | string)[] = []
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1)
    }
    nums.push(1)
    if (page > 3) nums.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      nums.push(i)
    }
    if (page < pages - 2) nums.push('...')
    nums.push(pages)
    return nums
  }

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPageNumbers().map((num, idx) =>
          typeof num === 'string' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                num === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {num}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
