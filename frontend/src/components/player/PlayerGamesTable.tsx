import { useNavigate } from 'react-router-dom'

export interface PlayerGameRow {
  game_id: number
  date: string
  opponent: string
  championship_badge: string
  won: boolean | null
  starter: boolean
  points: number
  three_pts_made: number
  shots_made: number
  ft_made: number
  fouls: number
}

export function PlayerGamesTable({ games, clubId }: { games: PlayerGameRow[]; clubId: number }) {
  const navigate = useNavigate()

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98] flex items-center gap-[10px] mb-3 after:content-[''] after:flex-1 after:h-px after:bg-black/10 dark:after:bg-white/8">
        Matchs joués
      </div>
      <div className="bg-background border border-black/10 dark:border-white/7 rounded-[12px] overflow-x-auto mb-5 shadow-[rgba(0,0,0,0.03)_0px_2px_8px] dark:shadow-none">
        <table className="w-full border-collapse text-[13px]" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th className="px-3 py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                Date
              </th>
              <th className="px-3 py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                Adversaire
              </th>
              <th className="px-3 py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                Comp.
              </th>
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap w-8" />
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                Pts
              </th>
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                3pts
              </th>
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                Tirs
              </th>
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                LF
              </th>
              <th className="px-3 py-[10px] text-center text-[10px] font-bold uppercase tracking-[0.5px] text-[#a39e98] bg-[#f6f5f4] dark:bg-[#161514] border-b border-black/8 dark:border-white/6 whitespace-nowrap">
                F.
              </th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr
                key={g.game_id}
                id={`game-${g.game_id}`}
                onClick={() => navigate(`/club/${clubId}/games/${g.game_id}`)}
                className="border-b border-black/6 dark:border-white/5 last:border-b-0 cursor-pointer hover:bg-[#f6f5f4] dark:hover:bg-[#2a2927] transition-colors"
              >
                <td className="px-3 py-[10px] text-[#a39e98] text-[12px] whitespace-nowrap">{g.date}</td>
                <td className="px-3 py-[10px] whitespace-nowrap">
                  {g.starter && (
                    <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#0075de] mr-[5px] align-middle" />
                  )}
                  {g.opponent}
                </td>
                <td className="px-3 py-[10px] whitespace-nowrap">
                  <span className="text-[10px] font-semibold px-[6px] py-[2px] rounded-full bg-[#f2f9ff] dark:bg-[rgba(0,117,222,0.2)] text-[#097fe8] dark:text-[#62aef0]">
                    {g.championship_badge}
                  </span>
                </td>
                <td className="px-3 py-[10px] text-center whitespace-nowrap">
                  {g.won === null ? (
                    <span className="text-[#a39e98]">–</span>
                  ) : g.won ? (
                    <span className="font-bold text-[#16a34a]">V</span>
                  ) : (
                    <span className="font-bold text-[#dc2626]">D</span>
                  )}
                </td>
                <td className="px-3 py-[10px] text-center font-bold text-[14px] text-[rgba(0,0,0,0.9)] dark:text-[rgba(255,255,255,0.9)]">
                  {g.points}
                </td>
                <td className="px-3 py-[10px] text-center font-semibold">{g.three_pts_made}</td>
                <td className="px-3 py-[10px] text-center font-semibold">{g.shots_made}</td>
                <td className="px-3 py-[10px] text-center font-semibold">{g.ft_made}</td>
                <td className="px-3 py-[10px] text-center font-semibold">{g.fouls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
