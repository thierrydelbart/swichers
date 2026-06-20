import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

interface TeamRef {
  id: number
  name: string
  suffix: string | null
}

interface NewsItem {
  id: number
  date: string
  championship: string
  team_a: TeamRef
  team_b: TeamRef
  score_a: number | null
  score_b: number | null
  blog_title: string
  blog_content: string | null
}

const CARD_SHADOW =
  'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px, rgba(0,0,0,0.02) 0px 0.8px 2.93px, rgba(0,0,0,0.01) 0px 0.175px 1.04px'

function teamLabel(t: TeamSummary): string {
  const g = t.gender === 'Male' ? 'M' : 'F'
  return [t.category, g, t.suffix].filter(Boolean).join(' ')
}

function getResult(item: NewsItem, ids: Set<number>): 'win' | 'loss' | null {
  if (item.score_a === null || item.score_b === null) return null
  const aIn = ids.has(item.team_a.id)
  const bIn = ids.has(item.team_b.id)
  if (!aIn && !bIn) return null
  return aIn
    ? item.score_a > item.score_b
      ? 'win'
      : 'loss'
    : item.score_b > item.score_a
      ? 'win'
      : 'loss'
}

const ScoreTag = ({ game, result }: { game: NewsItem; result: 'win' | 'loss' | null }) => {
  const colorClass = result === 'win' ? 'bg-[#f0fdf4] text-green-600' : 'bg-[#fff1f2] text-red-600'
  return (
    <div 
      className={`ml-auto text-[13px] font-bold bg-[#f6f5f4] px-2.5 py-[3px] rounded-md tracking-[-0.3px] ${colorClass}`} 
      title={game.team_a.name + " · " + game.team_b.name}
    >
      {game.score_a} – {game.score_b}
    </div>
  )
}

export default function Club({ clubId }: { clubId?: number } = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const resolvedId = clubId ?? paramId
  const [club, setClub] = useState<ClubData | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    if (!resolvedId) return
    fetch(`${API_BASE_URL}/clubs/${resolvedId}`)
      .then((res) => res.json() as Promise<ClubData>)
      .then(setClub)
      .catch(() => {})
  }, [resolvedId])

  useEffect(() => {
    if (!resolvedId) return
    const url = selectedTeamId
      ? `${API_BASE_URL}/clubs/${resolvedId}/news?teamId=${selectedTeamId}`
      : `${API_BASE_URL}/clubs/${resolvedId}/news`
    fetch(url)
      .then((res) => res.json() as Promise<NewsItem[]>)
      .then(setNews)
      .catch(() => {})
  }, [resolvedId, selectedTeamId])

  const clubTeamIds = useMemo(() => new Set(club?.teams.map((t) => t.id) ?? []), [club])

  const hero = news[0] ?? null
  const quickNews = news.slice(1, 4)
  const gridNews = news.slice(5)

  return (
    <div>
      {/* Team strip */}
      <div className="border-b border-black/10 bg-white overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex max-w-[1200px] mx-auto px-6">
          <button
            onClick={() => setSelectedTeamId(null)}
            className={[
              'px-[18px] py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors',
              selectedTeamId === null
                ? 'border-[#0075de] text-[#0075de] font-semibold'
                : 'border-transparent text-[#615d59] hover:text-black/95',
            ].join(' ')}
          >
            Toutes les équipes
          </button>
          {club?.teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={[
                'flex items-center gap-2 px-[18px] py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors',
                selectedTeamId === t.id
                  ? 'border-[#0075de] text-[#0075de] font-semibold'
                  : 'border-transparent text-[#615d59] hover:text-black/95',
              ].join(' ')}
            >
              {teamLabel(t)}
              <span className="text-[11px] font-semibold text-[#a39e98]">
                <span className="text-green-600">{t.wins}V</span>
                {' '}
                <span className="text-red-500">{t.losses}D</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#a39e98] mb-1.5">
          {club?.name ?? '…'}
        </p>
        <h1 className="text-[36px] font-bold tracking-[-1.1px] leading-none text-black/95">
          Clap Clap Info
        </h1>
      </div>

      {/* News feed */}
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        {news.length === 0 ? (
          <p className="text-sm text-[#a39e98]">Aucun article disponible.</p>
        ) : (
          <>
            {/* Top section: hero + sidebar */}
            <div
              className="grid gap-4 mb-4"
              style={{ gridTemplateColumns: quickNews.length > 0 ? '1fr 320px' : '1fr' }}
            >
              {/* Hero article */}
              {hero && (
                <Link
                  to={`/games/${hero.id}`}
                  className="block bg-white border border-black/10 rounded-xl overflow-hidden transition-shadow hover:shadow-xl"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="h-[3px] bg-[#0075de]" />
                  <div className="px-8 pt-7 pb-8">
                    <div className="flex items-center gap-2.5 mb-[18px]">
                      <span className="shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-[#f2f9ff] text-[#097fe8] tracking-[0.1px]">
                        {hero.championship}
                      </span>
                      <span className="text-[13px] text-[#a39e98]">{hero.date}</span>
                      {hero.score_a !== null && hero.score_b !== null && (
                        <ScoreTag game={hero} result={getResult(hero, clubTeamIds)} />
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-[#615d59] mb-3 tracking-[0.1px]">
                      {hero.team_a.name} · {hero.team_b.name}
                    </p>
                    <h2 className="text-[26px] font-bold tracking-[-0.6px] leading-[1.22] mb-3.5 text-black/95">
                      {hero.blog_title}
                    </h2>
                    {hero.blog_content && (
                      <p className="text-[15px] text-[#615d59] leading-relaxed mb-6 line-clamp-4">
                        {hero.blog_content}
                      </p>
                    )}
                    <span className="text-[13px] font-semibold text-[#0075de]">Lire la suite →</span>
                  </div>
                </Link>
              )}

              {/* Quick news sidebar */}
              {quickNews.length > 0 && (
                <div
                  className="bg-white border border-black/10 rounded-xl overflow-hidden flex flex-col"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="px-[18px] py-3.5 border-b border-black/[0.08] text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98]">
                    Dernières infos
                  </div>
                  {quickNews.map((item) => (
                    <Link
                      key={item.id}
                      to={`/games/${item.id}`}
                      className="block px-[18px] py-3.5 border-b border-black/[0.07] last:border-b-0 hover:bg-[#f6f5f4] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] text-[#a39e98] font-medium">{item.date}</span>
                        <span className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full bg-[#f2f9ff] text-[#097fe8] tracking-[0.1px]">
                          {item.championship}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-black/[0.88] leading-[1.35] line-clamp-2">
                        {item.blog_title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Article grid */}
            {gridNews.length > 0 && (
              <>
                <div className="flex items-center gap-2.5 px-0.5 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98] whitespace-nowrap">
                    Autres matchs
                  </span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {gridNews.map((item) => {
                    const result = getResult(item, clubTeamIds)
                    return (
                      <Link
                        key={item.id}
                        to={`/games/${item.id}`}
                        className="block bg-white border border-black/10 rounded-xl p-5 transition-[box-shadow,transform] hover:shadow-lg hover:-translate-y-px"
                        style={{ boxShadow: CARD_SHADOW }}
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-[#f2f9ff] text-[#097fe8] tracking-[0.1px]">
                            {item.championship}
                          </span>
                          <span className="text-[13px] text-[#a39e98]">{item.date}</span>
                          <ScoreTag game={item} result={result} />
                        </div>
                        <p className="text-[15px] font-bold tracking-[-0.2px] leading-[1.3] text-black/[0.92] line-clamp-2">
                          {item.blog_title}
                        </p>
                        {item.blog_content && (
                          <p className="text-[13px] text-[#615d59] leading-relaxed mb-3 mt-2 line-clamp-2">
                            {item.blog_content}
                          </p>
                        )}
                        <span className="text-[13px] font-semibold text-[#0075de]">Lire la suite →</span>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
