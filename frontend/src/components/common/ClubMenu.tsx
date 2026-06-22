import { Link } from "react-router-dom"

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

export function ClubMenu({ club, selectedTeamId }: { club: ClubData | null; selectedTeamId: number | null }) {

  return (
    <div className="border-b border-border bg-card overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex max-w-[1200px] mx-auto px-6">
        <Link
          to={`/club/${club?.id}`}
          className={[
            'px-[18px] py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors',
            selectedTeamId === null
              ? 'border-[#0075de] text-[#0075de] font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          ].join(' ')}
          
        >
          Clap Clap Info
        </Link  >
        {club && club?.teams.map((t) => (
          <Link
            key={t.id}
            to={`/club/${club?.id}/teams/${t.id}`}
            className={[
              'flex items-center gap-2 px-[18px] py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors',
              selectedTeamId === t.id
                ? 'border-[#0075de] text-[#0075de] font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {teamLabel(t) + ' '}
            <span className="text-[11px] font-semibold text-muted-foreground/60">
              <span className="text-green-600">{t.wins}</span>
              {'-'}
              <span className="text-red-500">{t.losses}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}