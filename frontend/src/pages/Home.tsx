import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'
const CLUB = 'CLAPIERS BASKET BALL'

interface TeamSummary {
  id: number
  name: string
  suffix: string | null
  category: string
  gender: string
}

export default function Home() {
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/teams?club=${encodeURIComponent(CLUB)}`)
      .then((res) => res.json() as Promise<TeamSummary[]>)
      .then(setTeams)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{CLUB}</h1>
      <p className="text-sm text-muted-foreground mb-8">Select a team</p>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : teams.length === 0 ? (
        <p className="text-muted-foreground">No teams found.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors"
            >
              <span className="font-medium">{team.category} {team.gender[0]} {team.suffix}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
