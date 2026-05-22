import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { TeamPageData, TeamPlayer, TeamGame } from '@/components/team/types'
import { StatsTable } from '@/components/common/StatsTable'
import type { Column } from '@/components/common/StatsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/useAuth'

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

function dateToNum(date: string): number {
  const [dd, mm, yyyy] = date.split('/')
  return parseInt(yyyy + mm + dd)
}

function timeToSec(t: string): number {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

function PlayerAdminPanel({
  selected,
  token,
  onDone,
  onCancel,
}: {
  selected: TeamPlayer[]
  token: string
  onDone: () => void
  onCancel: () => void
}) {
  const player = selected[0]
  const [lastName, setLastName] = useState(player.last_name)
  const [firstName, setFirstName] = useState(player.first_name)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLastName(player.last_name)
    setFirstName(player.first_name)
  }, [player.id, player.last_name, player.first_name])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ last_name: lastName, first_name: firstName }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Joueur modifié')
      onDone()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-xl md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:bg-muted/40 md:border md:border-border md:rounded-xl md:p-5 md:shadow-none md:my-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Modifier le joueur
      </p>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nom</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Prénom</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving || !lastName.trim() || !firstName.trim()}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  )
}

const GAME_COLUMNS: Column<TeamGame>[] = [
  {
    key: 'date',
    label: 'Date',
    align: 'left',
    getValue: (r) => dateToNum(r.date),
    render: (r) => r.date,
  },
  {
    key: 'win',
    label: 'W/L',
    align: 'left',
    sortable: false,
    getValue: () => 0,
    render: (r) => (
      <span className={r.win ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
        {r.win ? 'W' : 'L'}
      </span>
    ),
  },
  {
    key: 'opponent',
    label: 'Opponent',
    align: 'left',
    sortable: false,
    getValue: () => 0,
    render: (r) => r.opponent,
  },
  {
    key: 'home',
    label: 'H/A',
    align: 'left',
    sortable: false,
    getValue: () => 0,
    render: (r) => (
      <span className="text-muted-foreground">{r.home ? 'Home' : 'Away'}</span>
    ),
  },
  { key: 'points', label: 'PTS', getValue: (r) => r.points, render: (r) => r.points },
  { key: 'points_against', label: 'PTS vs', getValue: (r) => r.points_against, render: (r) => r.points_against },
  { key: 'three_pts_made', label: '3pts', getValue: (r) => r.three_pts_made, render: (r) => r.three_pts_made },
  { key: 'ft_made', label: 'FT', getValue: (r) => r.ft_made, render: (r) => r.ft_made },
  { key: 'fouls', label: 'Fouls', getValue: (r) => r.fouls, render: (r) => r.fouls },
]

const TOTALS_COLUMNS: Column<TeamPlayer>[] = [
  {
    key: 'player',
    label: 'Player',
    align: 'left',
    getValue: (r) => ( r.last_name + ' ' + r.first_name ),
    render: (r) => (
      <span className="font-medium">
        {r.last_name}{' '}
        <span className="text-muted-foreground font-normal">{r.first_name}</span>
      </span>
    ),
  },
  { key: 'gp', label: 'GP', getValue: (r) => r.gp, render: (r) => r.gp },
  { key: 'starts', label: 'Starts', getValue: (r) => r.starts, render: (r) => r.starts },
  {
    key: 'time_played',
    label: 'Time',
    getValue: (r) => timeToSec(r.totals.time_played),
    render: (r) => r.totals.time_played,
  },
  { key: 'points', label: 'PTS', getValue: (r) => r.totals.points, render: (r) => r.totals.points },
  { key: 'shots_made', label: 'Shots', getValue: (r) => r.totals.shots_made, render: (r) => r.totals.shots_made },
  { key: 'three_pts_made', label: '3pts', getValue: (r) => r.totals.three_pts_made, render: (r) => r.totals.three_pts_made },
  { key: 'two_pts_in_made', label: '2 in', getValue: (r) => r.totals.two_pts_in_made, render: (r) => r.totals.two_pts_in_made },
  { key: 'two_pts_out_made', label: '2 out', getValue: (r) => r.totals.two_pts_out_made, render: (r) => r.totals.two_pts_out_made },
  { key: 'ft_made', label: 'FT', getValue: (r) => r.totals.ft_made, render: (r) => r.totals.ft_made },
  { key: 'fouls', label: 'Fouls', getValue: (r) => r.totals.fouls, render: (r) => r.totals.fouls },
  { key: 'fouled_out', label: 'FO', getValue: (r) => r.fouled_out, render: (r) => r.fouled_out },
]

const AVERAGES_COLUMNS: Column<TeamPlayer>[] = [
  {
    key: 'player',
    label: 'Player',
    align: 'left',
    getValue: (r) => ( r.last_name + ' ' + r.first_name ),
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
  {
    key: 'fouled_out',
    label: 'FO',
    getValue: (r) => r.fouled_out,
    render: (r) => r.fouled_out,
  },
]

export default function Team() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [team, setTeam] = useState<TeamPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([])

  const fetchTeam = () => {
    setLoading(true)
    fetch(`${API_BASE_URL}/teams/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error('Failed to load team')
        return res.json() as Promise<TeamPageData>
      })
      .then((data) => { if (data) setTeam(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTeam()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSelectionChange = (keys: Set<string | number>) => {
    setSelectedPlayerIds((prev) => {
      const prevSet = new Set(prev)
      const added = [...keys].find((k) => !prevSet.has(k as number)) as number | undefined
      const removed = prev.find((k) => !keys.has(k))
      if (added !== undefined) return [...prev, added]
      if (removed !== undefined) return prev.filter((k) => k !== removed)
      return prev
    })
  }

  const selectedPlayers = selectedPlayerIds
    .map((pid) => team?.players.find((p) => p.id === pid))
    .filter((p): p is TeamPlayer => p !== undefined)

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading…
      </div>
    )

  if (notFound || !team)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Team not found.
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto px-8 py-12" style={{ minWidth: 660 }}>
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="text-primary hover:underline">Accueil</Link>
        {team.league && <>{' / '}<span>{team.league.code}</span></>}
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
        columns={AVERAGES_COLUMNS}
        defaultSortKey="points"
        rowKey={(r) => r.id}
        selectable={!!token}
        selectedKeys={new Set(selectedPlayerIds)}
        onSelectionChange={token ? handleSelectionChange : undefined}
      />

      {token && selectedPlayers.length === 1 && (
        <>
          <PlayerAdminPanel
            selected={selectedPlayers}
            token={token}
            onDone={() => { setSelectedPlayerIds([]); fetchTeam() }}
            onCancel={() => setSelectedPlayerIds([])}
          />
          <div className="h-28 md:hidden" />
        </>
      )}

      <h2 className="text-xl font-bold tracking-tight mb-4 mt-10">Totals</h2>
      <StatsTable
        rows={team.players}
        columns={TOTALS_COLUMNS}
        defaultSortKey="points"
        rowKey={(r) => r.id}
      />

      <h2 className="text-xl font-bold tracking-tight mb-4 mt-10">Games</h2>
      <StatsTable
        rows={team.games}
        columns={GAME_COLUMNS}
        defaultSortKey="date"
        defaultSortDir="desc"
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/games/${r.id}`)}
      />
    </div>
  )
}
