import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { TeamPageData } from '@/components/team/types'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

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

      <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
    </div>
  )
}
