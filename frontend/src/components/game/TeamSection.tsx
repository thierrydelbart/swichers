import { Link } from 'react-router-dom'
import type { TeamData } from './types'
import { PlayerTable } from './PlayerTable'
import { TotalsGrid } from './TotalsGrid'

export function TeamSection({ team, side }: { team: TeamData; side: 'Home' | 'Away' }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-xl font-bold tracking-tight">
          <Link to={`/teams/${team.team_id}`} className="hover:text-primary transition-colors">
            {team.name}
          </Link>
        </h2>
        <span className="text-sm text-muted-foreground font-medium">{side}</span>
      </div>
      <PlayerTable players={team.players} />
      <TotalsGrid totals={team.totals} />
    </section>
  )
}
