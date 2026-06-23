import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHero } from '@/components/common/PageHero'
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

export default function Player() {
  const { player_id: id } = useParams<{ player_id: string }>()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchProfile = () => {
    setLoading(true)
    setNotFound(false)
    fetch(`${API_BASE_URL}/players/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error()
        return res.json() as Promise<PlayerProfile>
      })
      .then((data) => { if (data) setProfile(data) })
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

      <div className="max-w-5xl mx-auto px-8 py-8" style={{ minWidth: 660 }}>
        {/* Stats, games and news will be added in steps 2–4 */}
      </div>
    </div>
  )
}
