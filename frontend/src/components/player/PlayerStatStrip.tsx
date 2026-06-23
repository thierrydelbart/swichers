export interface StatCell {
  avg: number
  min: { value: number; game_id: number }
  max: { value: number; game_id: number }
}

export interface PlayerStatsData {
  games_played: number
  team_games_total: number
  starters: number
  points: StatCell
  three_pts_made: StatCell
  shots_made: StatCell
  ft_made: StatCell
  fouls: StatCell
}

const STAT_CELLS: { label: string; key: keyof Pick<PlayerStatsData, 'points' | 'three_pts_made' | 'shots_made' | 'ft_made' | 'fouls'> }[] = [
  { label: 'Pts moy.', key: 'points' },
  { label: '3 pts moy.', key: 'three_pts_made' },
  { label: 'Tirs moy.', key: 'shots_made' },
  { label: 'LF moy.', key: 'ft_made' },
  { label: 'Fautes moy.', key: 'fouls' },
]

export function PlayerStatStrip({ stats, clubId }: { stats: PlayerStatsData; clubId: number }) {
  return (
    <div className="bg-background border-t border-black/8 dark:border-white/6">
      <div className="max-w-5xl mx-auto px-8" style={{ minWidth: 660 }}>
        <div className="grid grid-cols-6">
          <div className="py-[18px] border-r border-black/8 dark:border-white/6">
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#a39e98] mb-1">
              Matchs joués
            </div>
            <div className="text-[24px] font-bold tracking-[-0.6px] text-[#0075de] leading-none mb-1">
              {stats.games_played}
              <span className="text-[14px] font-medium text-[#a39e98]">
                /{stats.team_games_total}
              </span>
            </div>
            <div className="text-[11px] text-[#a39e98]">Titulaire : {stats.starters}</div>
          </div>

          {STAT_CELLS.map((cell, i) => (
            <div
              key={cell.key}
              className={`py-[18px] pl-[18px] ${i < STAT_CELLS.length - 1 ? 'border-r border-black/8 dark:border-white/6' : ''}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#a39e98] mb-1">
                {cell.label}
              </div>
              <div className="text-[24px] font-bold tracking-[-0.6px] text-[rgba(0,0,0,0.95)] dark:text-[rgba(255,255,255,0.9)] leading-none mb-1">
                {stats[cell.key].avg}
              </div>
              {stats.games_played > 1 && (
                <div className="text-[11px] text-[#a39e98]">
                  <a
                    href={`/club/${clubId}/games/${stats[cell.key].min.game_id}`}
                    className="font-semibold text-[#dc2626] dark:text-[#f87171] hover:underline"
                  >
                    min {stats[cell.key].min.value}
                  </a>
                  {' · '}
                  <a
                    href={`/club/${clubId}/games/${stats[cell.key].max.game_id}`}
                    className="font-semibold text-[#16a34a] dark:text-[#4ade80] hover:underline"
                  >
                    max {stats[cell.key].max.value}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
