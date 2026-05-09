import { useState } from 'react'
import type { PlayerStat } from './types'

type StatKey =
  | 'time_played'
  | 'points'
  | 'shots_made'
  | 'three_pts_made'
  | 'two_pts_in_made'
  | 'two_pts_out_made'
  | 'ft_made'
  | 'fouls'
type SortDir = 'asc' | 'desc'

const STAT_COLUMNS: { key: StatKey; label: string }[] = [
  { key: 'time_played', label: 'Time' },
  { key: 'points', label: 'PTS' },
  { key: 'shots_made', label: 'Shots' },
  { key: 'three_pts_made', label: '3pts' },
  { key: 'two_pts_in_made', label: '2 in' },
  { key: 'two_pts_out_made', label: '2 out' },
  { key: 'ft_made', label: 'FT' },
  { key: 'fouls', label: 'Fouls' },
]

function timeToSec(t: string | null): number {
  if (!t) return -1
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

function sortPlayers(players: PlayerStat[], col: StatKey, dir: SortDir): PlayerStat[] {
  return [...players].sort((a, b) => {
    const aVal = col === 'time_played' ? timeToSec(a.time_played) : (a[col] as number)
    const bVal = col === 'time_played' ? timeToSec(b.time_played) : (b[col] as number)
    return dir === 'desc' ? bVal - aVal : aVal - bVal
  })
}

export function PlayerTable({ players }: { players: PlayerStat[] }) {
  const [col, setCol] = useState<StatKey>('points')
  const [dir, setDir] = useState<SortDir>('desc')

  const toggle = (c: StatKey) => {
    if (c === col) setDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setCol(c); setDir('desc') }
  }

  const sorted = sortPlayers(players, col, dir)

  return (
    <div className="border border-border rounded-xl overflow-x-auto mb-4 shadow-sm">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-8">
              #
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Players
            </th>
            {STAT_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => toggle(key)}
                className={`px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap transition-colors ${
                  col === key
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}{' '}
                {col === key ? (
                  dir === 'desc' ? '↓' : '↑'
                ) : (
                  <span className="opacity-40">↕</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr
              key={i}
              className="border-t border-border/40 hover:bg-muted/50 transition-colors"
            >
              <td className="px-3 py-2 text-muted-foreground font-medium">{p.number}</td>
              <td className="px-3 py-2">
                <span className={p.starter ? 'font-bold' : 'font-medium'}>
                  {p.last_name}
                </span>{' '}
                <span className={p.starter ? 'font-bold' : 'text-muted-foreground font-normal'}>
                  {p.first_name}
                </span>
              </td>
              {STAT_COLUMNS.map(({ key }) => (
                <td key={key} className="px-3 py-2 text-right tabular-nums">
                  {key === 'time_played' ? (p.time_played ?? '—') : (p[key] as number)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
