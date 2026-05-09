import type { Totals } from './types'

const TOTAL_ROWS: { key: keyof Totals; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'starters', label: 'Starters' },
  { key: 'bench', label: 'Bench' },
  { key: 'first_half', label: '1st Half' },
  { key: 'second_half', label: '2nd Half' },
  { key: 'overtime', label: 'Overtime' },
]

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold leading-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
    </div>
  )
}

export function TotalsGrid({ totals }: { totals: Totals }) {
  const cards = TOTAL_ROWS.filter(
    ({ key }) => key !== 'overtime' || totals.overtime.points > 0,
  )
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ key, label }) => {
        const t = totals[key]
        return (
          <div key={key} className="bg-muted border border-border rounded-lg p-3.5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
              {label}
            </div>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
              <StatCell value={t.points} label="Points" />
              <StatCell value={t.fouls} label="Fouls" />
              <StatCell value={t.three_pts_made} label="3pts" />
              <StatCell value={t.ft_made} label="FT" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
