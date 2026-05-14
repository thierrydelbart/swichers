import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { GameData } from '@/components/game/types'
import { TeamSection } from '@/components/game/TeamSection'

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
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading…
      </div>
    )

  if (notFound || !game)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Game not found.
      </div>
    )

  const homeScore = game.home.totals.team.points
  const awayScore = game.away.totals.team.points

  return (
    <div className="max-w-5xl mx-auto px-8 py-12" style={{ minWidth: 660 }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="text-primary hover:underline">Accueil</Link>
        {game.league && <>{' / '}<span>{game.league.code}</span></>}
        {' / '}
        <span>{game.championship.name}</span>
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
          {game.file_id !== null && (
            <a
              href={`${API_BASE_URL}/files/${game.file_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5"
            >
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Feuille de match
              </span>
              <span className="text-sm font-medium text-primary hover:underline">
                Voir le PDF →
              </span>
            </a>
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
