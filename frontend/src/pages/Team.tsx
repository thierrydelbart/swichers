import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { TeamPageData, TeamPlayer } from '@/components/team/types'
import { StatsTable } from '@/components/common/StatsTable'
import type { Column } from '@/components/common/StatsTable'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function timeToSec(t: string): number {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

const COLUMNS: Column<TeamPlayer>[] = [
  {
    key: 'player',
    label: 'Player',
    align: 'left',
    sortable: false,
    getValue: () => 0,
    render: (r) => (
      <span className="font-medium">
        {r.last_name}{' '}
        <span className="text-muted-foreground font-normal">{r.first_name}</span>
      </span>
    ),
  },
  {
    key: 'gp',
    label: 'GP',
    getValue: (r) => r.gp,
    render: (r) => r.gp,
  },
  {
    key: 'starts',
    label: 'Starts',
    getValue: (r) => r.starts,
    render: (r) => r.starts,
  },
  {
    key: 'fouled_out',
    label: 'Fouled out',
    getValue: (r) => r.fouled_out,
    render: (r) => r.fouled_out,
  },
  {
    key: 'time_played',
    label: 'Time',
    getValue: (r) => timeToSec(r.averages.time_played),
    render: (r) => r.averages.time_played,
  },
  {
    key: 'points',
    label: 'PTS',
    getValue: (r) => r.averages.points,
    render: (r) => r.averages.points,
  },
  {
    key: 'shots_made',
    label: 'Shots',
    getValue: (r) => r.averages.shots_made,
    render: (r) => r.averages.shots_made,
  },
  {
    key: 'three_pts_made',
    label: '3pts',
    getValue: (r) => r.averages.three_pts_made,
    render: (r) => r.averages.three_pts_made,
  },
  {
    key: 'two_pts_in_made',
    label: '2 in',
    getValue: (r) => r.averages.two_pts_in_made,
    render: (r) => r.averages.two_pts_in_made,
  },
  {
    key: 'two_pts_out_made',
    label: '2 out',
    getValue: (r) => r.averages.two_pts_out_made,
    render: (r) => r.averages.two_pts_out_made,
  },
  {
    key: 'ft_made',
    label: 'FT',
    getValue: (r) => r.averages.ft_made,
    render: (r) => r.averages.ft_made,
  },
  {
    key: 'fouls',
    label: 'Fouls',
    getValue: (r) => r.averages.fouls,
    render: (r) => r.averages.fouls,
  },
]

export default function Team() {
  const { id } = useParams<{ id: string }>()
  const [team, setTeam] = useState<TeamPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/teams/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error('Failed to load team')
        return res.json() as Promise<TeamPageData>
      })
      .then((data) => { if (data) setTeam(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )

  if (notFound || !team)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Team not found.
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto px-8 py-12" style={{ minWidth: 660 }}>
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        {' / '}
        <span>{team.name}</span>
      </nav>

      <div className="bg-muted border border-border rounded-2xl p-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{team.name}</h1>
        <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
          <MetaItem label="Category" value={team.category} />
          <MetaItem label="Gender" value={team.gender} />
          <MetaItem label="Games played" value={String(team.games_played)} />
          {team.championships.length > 0 && (
            <MetaItem
              label="Championships"
              value={team.championships.join(' · ')}
            />
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-4">Averages</h2>
      <StatsTable
        rows={team.players}
        columns={COLUMNS}
        defaultSortKey="points"
        rowKey={(r) => r.id}
      />
    </div>
  )
}
