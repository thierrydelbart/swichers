import { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  sortable?: boolean
  getValue: (row: T) => number
  render: (row: T) => React.ReactNode
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  defaultSortKey: string
  defaultSortDir?: 'asc' | 'desc'
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
}

export function StatsTable<T>({
  rows,
  columns,
  defaultSortKey,
  defaultSortDir = 'desc',
  rowKey,
  onRowClick,
}: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir)

  const toggle = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortCol = columns.find((c) => c.key === sortKey)
  const sorted = sortCol
    ? [...rows].sort((a, b) => {
        const av = sortCol.getValue(a)
        const bv = sortCol.getValue(b)
        return sortDir === 'desc' ? bv - av : av - bv
      })
    : rows

  return (
    <div className="border border-border rounded-xl overflow-x-auto mb-4 shadow-sm">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable !== false ? () => toggle(col.key) : undefined}
                className={[
                  'px-3 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap select-none',
                  col.align === 'left' ? 'text-left' : 'text-right',
                  col.sortable !== false ? 'cursor-pointer transition-colors' : '',
                  sortKey === col.key
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {col.label}{' '}
                {col.sortable !== false &&
                  (sortKey === col.key ? (
                    sortDir === 'desc' ? '↓' : '↑'
                  ) : (
                    <span className="opacity-40">↕</span>
                  ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-t border-border/40 hover:bg-muted/50 transition-colors${onRowClick ? ' cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2 ${col.align === 'left' ? 'text-left' : 'text-right tabular-nums'}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
