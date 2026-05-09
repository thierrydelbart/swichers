import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

interface PlayerStat {
  number: number
  last_name: string
  first_name: string
  starter: boolean
  time_played: string | null
  points: number
  shots_made: number
  three_pts_made: number
  two_pts_in_made: number
  two_pts_out_made: number
  ft_made: number
  fouls: number
}

interface TotalStat {
  points: number
  fouls: number
  three_pts_made: number
  ft_made: number
}

interface Totals {
  team: TotalStat
  starters: TotalStat
  bench: TotalStat
  first_half: TotalStat
  second_half: TotalStat
  overtime: TotalStat
}

interface TeamData {
  name: string
  players: PlayerStat[]
  totals: Totals
  coach: { name: string; fouls: number } | null
}

interface GameData {
  id: number
  game_number: string
  date: string
  time: string
  venue: string
  group: string
  championship: { name: string; season: string | null }
  referees: string[]
  home: TeamData
  away: TeamData
}

type StatKey = 'time_played' | 'points' | 'shots_made' | 'three_pts_made' | 'two_pts_in_made' | 'two_pts_out_made' | 'ft_made' | 'fouls'
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

const TOTAL_ROWS: { key: keyof Totals; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'starters', label: 'Starters' },
  { key: 'bench', label: 'Bench' },
  { key: 'first_half', label: '1st Half' },
  { key: 'second_half', label: '2nd Half' },
  { key: 'overtime', label: 'Overtime' },
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

function PlayerTable({ players }: { players: PlayerStat[] }) {
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

function TotalsGrid({ totals }: { totals: Totals }) {
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

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold leading-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
    </div>
  )
}

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

function TeamSection({ team, side }: { team: TeamData; side: 'Home' | 'Away' }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-xl font-bold tracking-tight">{team.name}</h2>
        <span className="text-sm text-muted-foreground font-medium">{side}</span>
      </div>
      <PlayerTable players={team.players} />
      <TotalsGrid totals={team.totals} />
    </section>
  )
}

export default function Game() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/games/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true)
          return null
        }
        if (!res.ok) throw new Error('Failed to load game')
        return res.json() as Promise<GameData>
      })
      .then((data) => {
        if (data) setGame(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )

  if (notFound || !game)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Game not found.
      </div>
    )

  const homeScore = game.home.totals.team.points
  const awayScore = game.away.totals.team.points

  return (
    <div className="max-w-5xl mx-auto px-8 py-12" style={{ minWidth: 660 }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="text-primary hover:underline">
          Home
        </Link>
        {' / '}
        <span>
          {game.championship.name}
          {game.championship.season ? ` ${game.championship.season}` : ''}
        </span>
        {' / '}
        <span>Match #{game.game_number}</span>
      </nav>

      {/* Game header */}
      <div className="bg-muted border border-border rounded-2xl p-8 mb-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 mb-7">
          <div className="text-2xl font-bold tracking-tight">{game.home.name}</div>
          <div className="text-center">
            <div className="text-4xl font-bold tabular-nums tracking-tight leading-none">
              {homeScore}{' '}
              <span className="text-muted-foreground">–</span>{' '}
              {awayScore}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-1.5">
              Final score
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-right">
            {game.away.name}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
          <MetaItem label="Date" value={`${game.date} · ${game.time}`} />
          <MetaItem label="Venue" value={game.venue} />
          <MetaItem label="Group" value={game.group} />
          <MetaItem label="Game #" value={game.game_number} />
          {game.referees.length > 0 && (
            <MetaItem label="Referees" value={game.referees.join(' · ')} />
          )}
        </div>
      </div>

      <hr className="border-border mb-10" />

      <TeamSection team={game.home} side="Home" />

      <hr className="border-border mb-10" />

      <TeamSection team={game.away} side="Away" />
    </div>
  )
}
