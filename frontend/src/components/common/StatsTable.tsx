import { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  sortable?: boolean
  getValue: (row: T) => string | number
  render: (row: T) => React.ReactNode
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  defaultSortKey: string
  defaultSortDir?: 'asc' | 'desc'
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedKeys?: Set<string | number>
  onSelectionChange?: (keys: Set<string | number>) => void
}

export function StatsTable<T>({
  rows,
  columns,
  defaultSortKey,
  defaultSortDir = 'desc',
  rowKey,
  onRowClick,
  selectable,
  selectedKeys,
  onSelectionChange,
}: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir)

  const toggle = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortCol = columns.find((c) => c.key === sortKey)
  const sorted = sortCol
    ? [...rows].sort((a: T, b: T) => {
        const av: string | number = sortCol.getValue(a)
        const bv: string | number = sortCol.getValue(b)
        if (typeof av === 'string' && typeof bv === 'string') {
          return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
        }
        const avNum = typeof av === 'number' ? av : parseFloat(av)
        const bvNum = typeof bv === 'number' ? bv : parseFloat(bv)
        return sortDir === 'desc' ? bvNum - avNum : avNum - bvNum
      })
    : rows

  const toggleKey = (key: string | number) => {
    const next = new Set(selectedKeys ?? [])
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectionChange?.(next)
  }

  return (
    <div className="border border-border rounded-xl overflow-x-auto mb-4 shadow-sm">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead className="bg-muted">
          <tr>
            {selectable && <th className="px-3 py-2.5 w-8" />}
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
          {sorted.map((row) => {
            const key = rowKey(row)
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-border/40 hover:bg-muted/50 transition-colors${onRowClick ? ' cursor-pointer' : ''}`}
              >
                {selectable && (
                  <td
                    className="px-3 py-2"
                    onClick={(e) => { e.stopPropagation(); toggleKey(key) }}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedKeys?.has(key) ?? false}
                      className="cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 ${col.align === 'left' ? 'text-left' : 'text-right tabular-nums'}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
