import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_BASE_URL } from '@/lib/config'

interface TeamSummary {
  id: number
  category: string
  gender: string
  suffix: string | null
  wins: number
  losses: number
}

interface ClubData {
  id: number
  name: string
  teams: TeamSummary[]
}

function teamLabel(t: TeamSummary): string {
  const g = t.gender === 'Male' ? 'M' : 'F'
  return [t.category, g, t.suffix].filter(Boolean).join(' ')
}

export default function Club({ clubId }: { clubId?: number } = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const resolvedId = clubId ?? paramId
  const [club, setClub] = useState<ClubData | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

  useEffect(() => {
    if (!resolvedId) return
    fetch(`${API_BASE_URL}/clubs/${resolvedId}`)
      .then((res) => res.json() as Promise<ClubData>)
      .then(setClub)
      .catch(() => {})
  }, [resolvedId])

  return (
    <div>
      {/* Team strip */}
      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="flex max-w-[1200px] mx-auto px-6">
          <button
            onClick={() => setSelectedTeamId(null)}
            className={[
              'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              selectedTeamId === null
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Toutes les équipes
          </button>
          {club?.teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                selectedTeamId === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {teamLabel(t)}
              <span className="text-xs">
                <span className="text-green-600 font-semibold">{t.wins}V</span>
                {' '}
                <span className="text-red-500 font-semibold">{t.losses}D</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {club?.name ?? '…'}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Clap Clap Info</h1>
      </div>

      {/* News feed — Step 2 */}
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        <p className="text-muted-foreground text-sm">
          Les articles arrivent dans l'étape 2.
        </p>
      </div>
    </div>
  )
}
