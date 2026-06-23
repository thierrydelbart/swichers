import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHero } from '@/components/common/PageHero'
import { PlayerStatStrip } from '@/components/player/PlayerStatStrip'
import type { PlayerStatsData, StatCell } from '@/components/player/PlayerStatStrip'
import { API_BASE_URL } from '@/lib/config'

interface PlayerProfile {
  id: number
  last_name: string
  first_name: string
  initials: string
  club: { id: number; name: string }
  teams: { id: number; label: string }[]
  season: string | null
}

interface PlayerStatsRaw {
  games_played: number
  team_games_total: number
  starters: number
  points: StatCell | null
  three_pts_made: StatCell | null
  shots_made: StatCell | null
  ft_made: StatCell | null
  fouls: StatCell | null
}

export default function Player() {
  const { player_id: id } = useParams<{ player_id: string }>()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [stats, setStats] = useState<PlayerStatsRaw | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchProfile = () => {
    setLoading(true)
    setNotFound(false)
    setStats(null)
    Promise.all([
      fetch(`${API_BASE_URL}/players/${id}`).then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error()
        return res.json() as Promise<PlayerProfile>
      }),
      fetch(`${API_BASE_URL}/players/${id}/stats`).then((res) => {
        if (!res.ok) return null
        return res.json() as Promise<PlayerStatsRaw>
      }),
    ])
      .then(([profileData, statsData]) => {
        if (profileData) setProfile(profileData)
        if (statsData) setStats(statsData)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProfile() }, [id])

  if (loading)
    return <div className="flex items-center justify-center py-24 text-muted-foreground">Loading…</div>

  if (notFound || !profile)
    return <div className="flex items-center justify-center py-24 text-muted-foreground">Joueur introuvable.</div>

  const subtitle = (
    <>
      <span>{profile.club.name.toUpperCase()}</span>
      {profile.teams.map((t) => (
        <span key={t.id} className="flex items-center gap-2">
          <span className="text-white/20">·</span>
          <span>{t.label}</span>
        </span>
      ))}
    </>
  )

  const statsData = stats && stats.games_played > 0 && stats.points
    ? (stats as PlayerStatsData)
    : null

  return (
    <div>
      <PageHero
        title={`${profile.first_name} ${profile.last_name}`}
        subtitle={subtitle}
        initials={profile.initials}
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: profile.club.name, href: `/club/${profile.club.id}` },
          { label: `${profile.first_name} ${profile.last_name}` },
        ]}
        seasonLabel={profile.season ? `Saison ${profile.season}` : undefined}
      />

      {statsData && <PlayerStatStrip stats={statsData} clubId={profile.club.id} />}

      <div className="max-w-5xl mx-auto px-8 py-8" style={{ minWidth: 660 }}>
        {/* Games and news will be added in steps 3–4 */}
      </div>
    </div>
  )
}
