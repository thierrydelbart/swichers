import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '@/components/common/PageHero'
import { PlayerStatStrip } from '@/components/player/PlayerStatStrip'
import type { PlayerStatsData, StatCell } from '@/components/player/PlayerStatStrip'
import { PlayerGamesTable } from '@/components/player/PlayerGamesTable'
import type { PlayerGameRow } from '@/components/player/PlayerGamesTable'
import { PlayerNewsSidebar } from '@/components/player/PlayerNewsSidebar'
import type { PlayerNewsItem } from '@/components/player/PlayerNewsSidebar'
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
  const [games, setGames] = useState<PlayerGameRow[] | null>(null)
  const [news, setNews] = useState<PlayerNewsItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchProfile = () => {
    setLoading(true)
    setNotFound(false)
    setStats(null)
    setGames(null)
    setNews(null)
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
      fetch(`${API_BASE_URL}/players/${id}/games`).then((res) => {
        if (!res.ok) return null
        return res.json() as Promise<PlayerGameRow[]>
      }),
      fetch(`${API_BASE_URL}/players/${id}/news`).then((res) => {
        if (!res.ok) return null
        return res.json() as Promise<PlayerNewsItem[]>
      }),
    ])
      .then(([profileData, statsData, gamesData, newsData]) => {
        if (profileData) setProfile(profileData)
        if (statsData) setStats(statsData)
        if (gamesData) setGames(gamesData)
        if (newsData) setNews(newsData)
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
          <Link to={`/teams/${t.id}`} className="hover:text-white transition-colors">{t.label}</Link>
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div>
            {games && games.length > 0 && (
              <PlayerGamesTable games={games} clubId={profile.club.id} />
            )}
          </div>
          <div>
            {news && <PlayerNewsSidebar news={news} clubId={profile.club.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}
