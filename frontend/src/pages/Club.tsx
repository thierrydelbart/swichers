import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { API_BASE_URL } from '@/lib/config'
import { ClubMenu } from '@/components/common/ClubMenu'
import Team from './Team'

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
  championship: {
    name: string
    code: string
    group: string
    category: string
    gender: string
  }
  team_a: TeamRef
  team_b: TeamRef
  score_a: number | null
  score_b: number | null
  blog_title: string
  blog_content: string | null
}

const CARD_SHADOW =
  'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px, rgba(0,0,0,0.02) 0px 0.8px 2.93px, rgba(0,0,0,0.01) 0px 0.175px 1.04px'


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
  const colorClass = result === 'win'
    ? 'bg-[#f0fdf4] dark:bg-green-950 text-green-600 dark:text-green-400'
    : 'bg-[#fff1f2] dark:bg-red-950 text-red-600 dark:text-red-400'
  return (
    <div
      className={`ml-auto text-[13px] font-bold px-2.5 py-[3px] rounded-md tracking-[-0.3px] ${colorClass}`}
      title={game.team_a.name + ' · ' + game.team_b.name}
    >
      {game.score_a} – {game.score_b}
    </div>
  )
}

function ClubPage({ club }: { club?: ClubData | null } = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    if (!club) return
    const url = selectedCategory
      ? `${API_BASE_URL}/clubs/${club.id}/news?category=${selectedCategory}`
      : `${API_BASE_URL}/clubs/${club.id}/news`
    fetch(url)
      .then((res) => res.json() as Promise<NewsItem[]>)
      .then(setNews)
      .catch(() => {})
  }, [club, selectedCategory])

  const clubTeamIds = useMemo(() => new Set(club?.teams.map((t) => t.id) ?? []), [club])
  const clubCategories = useMemo(() => new Set(club?.teams.map((t) => t?.category) ?? []), [club])

  const hero = news[0] ?? null
  const quickNews = news.slice(1, 4)
  const gridNews = news.slice(5)

  return (
    <div>
      {/* Page header */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-muted-foreground/60 mb-1.5">
          {club?.name ?? '…'}
        </p>
        <h1 className="text-[28px] md:text-[36px] font-bold tracking-[-1.1px] leading-none text-foreground">
          Clap Clap Info
        </h1>
      </div>

      {/* Team filters */}
      <div className="bg-card overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-3">
        <div className="flex max-w-[1200px] mx-auto px-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={[
              'cursor-pointer shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full tracking-[0.1px]',
              'whitespace-nowrap transition-colors',
              selectedCategory === null
                ? 'bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400'
                : 'bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400 font-bold',
            ].join(' ')}
          >
            Toutes les équipes
          </button>
          {[...clubCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={[
                'cursor-pointer shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full tracking-[0.1px]',
                'whitespace-nowrap transition-colors',
                selectedCategory === null
                  ? 'bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400'
                  : 'bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400 font-bold',
              ].join(' ')}
            >
              {cat}

            </button>
          ))}
        </div>
      </div>

      {/* News feed */}
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">Aucun article disponible.</p>
        ) : (
          <>
            {/* Top section: hero + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-4">
              {/* Hero article */}
              {hero && (
                <Link
                  to={`/games/${hero.id}`}
                  className="block bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-xl"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="h-[3px] bg-[#0075de]" />
                  <div className="px-5 pt-5 pb-6 md:px-8 md:pt-7 md:pb-8">
                    <div className="flex items-center gap-2.5 mb-[18px]">
                      <span className="shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400 tracking-[0.1px]">
                        {hero.championship.category + "  " + hero.championship.code}
                      </span>

                      <span className="text-[13px] text-muted-foreground/60">{hero.date}</span>
                      {hero.score_a !== null && hero.score_b !== null && (
                        <ScoreTag game={hero} result={getResult(hero, clubTeamIds)} />
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground mb-3 tracking-[0.1px]">
                      {hero.team_a.name} · {hero.team_b.name}
                    </p>
                    <h2 className="text-[20px] md:text-[26px] font-bold tracking-[-0.6px] leading-[1.22] mb-3.5 text-foreground">
                      {hero.blog_title}
                    </h2>
                    {hero.blog_content && (
                      <p className="text-[15px] text-muted-foreground leading-relaxed mb-6 line-clamp-4">
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
                  className="bg-card border border-border rounded-xl overflow-hidden flex flex-col"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="px-[18px] py-3.5 border-b border-border text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground/60">
                    Dernières infos
                  </div>
                  {quickNews.map((item) => (
                    <Link
                      key={item.id}
                      to={`/games/${item.id}`}
                      className="block px-[18px] py-3.5 border-b border-border last:border-b-0 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] text-muted-foreground/60 font-medium">{item.date}</span>
                        <span className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400 tracking-[0.1px]">
                          {item.championship.category + "  " + item.championship.code}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground leading-[1.35] line-clamp-2">
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
                  <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground/60 whitespace-nowrap">
                    Autres matchs
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {gridNews.map((item) => {
                    const result = getResult(item, clubTeamIds)
                    return (
                      <Link
                        key={item.id}
                        to={`/games/${item.id}`}
                        className="block bg-card border border-border rounded-xl p-5 transition-[box-shadow,transform] hover:shadow-lg hover:-translate-y-px"
                        style={{ boxShadow: CARD_SHADOW }}
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-[3px] rounded-full bg-[#f2f9ff] dark:bg-blue-950 text-[#097fe8] dark:text-blue-400 tracking-[0.1px]">
                            {item.championship.category + "  " + item.championship.code}
                          </span>
                          <span className="text-[13px] text-muted-foreground/60">{item.date}</span>
                          <ScoreTag game={item} result={result} />
                        </div>
                        <p className="text-[15px] font-bold tracking-[-0.2px] leading-[1.3] text-foreground line-clamp-2">
                          {item.blog_title}
                        </p>
                        {item.blog_content && (
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 mt-2 line-clamp-2">
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


export default function Club({ clubId }: { clubId?: number } = {}) {
  const params = useParams()
  const resolvedClubId = clubId ?? params.id
  const [club, setClub] = useState<ClubData | null>(null)

  const teamIdFromUrl = Number(params['*']?.split('teams/')[1]) || null;

  useEffect(() => {
    if (!resolvedClubId) return
    fetch(`${API_BASE_URL}/clubs/${resolvedClubId}`)
      .then((res) => res.json() as Promise<ClubData>)
      .then(setClub)
      .catch(() => {})
  }, [resolvedClubId])

  return (
    <div>
      {/* Team menu */}
      <ClubMenu club={club} selectedTeamId={teamIdFromUrl} />

      <Routes>
        <Route path="/" element={<ClubPage club={club} />} />
        <Route path="teams/:id" element={<Team />} />
      </Routes>
    </div>
  )
}