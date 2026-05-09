import type { TeamData } from './types'
import { PlayerTable } from './PlayerTable'
import { TotalsGrid } from './TotalsGrid'

export function TeamSection({ team, side }: { team: TeamData; side: 'Home' | 'Away' }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-xl font-bold tracking-tight">{team.name}</h2>
        <span className="text-sm text-muted-foreground font-medium">{side}</span>
      </div>
      <PlayerTable players={team.players} />
      <TotalsGrid totals={team.totals} />
    </section>
  )
}
