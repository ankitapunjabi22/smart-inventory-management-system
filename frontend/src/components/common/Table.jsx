 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React from 'react'
import Spinner from './Spinner'


















function Table({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  keyExtractor = (row, index) => _optionalChain([row, 'optionalAccess', _ => _._id]) || _optionalChain([row, 'optionalAccess', _2 => _2.id]) || String(index)
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || (typeof col.accessor === 'string' ? col.accessor : col.header) || idx}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, rowIdx) => {
              const rowKey = typeof keyExtractor === 'function' 
                ? keyExtractor(row, rowIdx) 
                : _optionalChain([(row ), 'optionalAccess', _3 => _3._id]) || _optionalChain([(row ), 'optionalAccess', _4 => _4.id]) || rowIdx

              return (
                <tr key={rowKey} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, colIdx) => {
                    const colKey = col.key || (typeof col.accessor === 'string' ? col.accessor : col.header) || colIdx
                    
                    let cellContent = null
                    if (typeof col.render === 'function') {
                      cellContent = col.render(row)
                    } else if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row)
                    } else if (typeof col.accessor === 'string') {
                      cellContent = _optionalChain([(row ), 'optionalAccess', _5 => _5[col.accessor]])
                    } else if (col.key) {
                      cellContent = _optionalChain([(row ), 'optionalAccess', _6 => _6[col.key]])
                    }

                    return (
                      <td key={colKey} className={`px-4 py-3 text-sm text-slate-700 ${col.className || ''}`}>
                        {cellContent}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
