import { Link } from 'react-router-dom'

export interface PlayerNewsItem {
  game_id: number
  date: string
  championship_badge: string
  title: string
}

export function PlayerNewsSidebar({ news, clubId }: { news: PlayerNewsItem[]; clubId: number }) {
  if (news.length === 0) return null

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98] flex items-center gap-[10px] mb-3 after:content-[''] after:flex-1 after:h-px after:bg-black/10 dark:after:bg-white/8">
        Articles mentionnant ce joueur
      </div>
      <div className="bg-background border border-black/10 dark:border-white/7 rounded-[12px] overflow-hidden shadow-[rgba(0,0,0,0.03)_0px_2px_8px] dark:shadow-none">
        {news.map((item) => (
          <Link
            key={item.game_id}
            to={`/club/${clubId}/games/${item.game_id}`}
            className="block px-[18px] py-[14px] border-b border-black/6 dark:border-white/5 last:border-b-0 hover:bg-[#f6f5f4] dark:hover:bg-[#2a2927] transition-colors no-underline text-inherit"
          >
            <div className="flex items-center gap-2 mb-[5px]">
              <span className="text-[11px] text-[#a39e98]">{item.date}</span>
              <span className="text-[10px] font-semibold px-[6px] py-[2px] rounded-full bg-[#f2f9ff] dark:bg-[rgba(0,117,222,0.2)] text-[#097fe8] dark:text-[#62aef0]">
                {item.championship_badge}
              </span>
            </div>
            <div className="text-[13px] font-semibold leading-[1.35] text-[rgba(0,0,0,0.88)] dark:text-[rgba(255,255,255,0.88)] line-clamp-2">
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
