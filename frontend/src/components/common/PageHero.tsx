import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeroProps {
  title: string
  subtitle: ReactNode
  initials: string
  breadcrumbs: Breadcrumb[]
  seasonLabel?: string
  statStrip?: ReactNode
}

export function PageHero({ title, subtitle, initials, breadcrumbs, seasonLabel, statStrip }: PageHeroProps) {
  return (
    <div className="bg-[#31302e] dark:bg-[#111110]">
      <div className="max-w-5xl mx-auto px-8" style={{ minWidth: 660 }}>
        <div className="flex items-center justify-between pt-7 pb-5">
          <nav className="flex items-center gap-1.5 text-xs text-white/40">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/20">›</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-white/55 hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          {seasonLabel && (
            <span
              className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98] px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {seasonLabel}
            </span>
          )}
        </div>

        <div className="flex items-end gap-5 pb-7">
          <div
            className="w-[72px] h-[72px] rounded-full bg-[#0075de] flex items-center justify-center text-[26px] font-bold text-white shrink-0"
            style={{ border: '3px solid rgba(255,255,255,0.15)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold tracking-tight text-white leading-[1.05] mb-1.5">
              {title}
            </h1>
            <div className="text-sm text-white/50 flex items-center gap-2 flex-wrap">
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      {statStrip && (
        <div className="bg-background border-t border-black/8 dark:border-white/6">
          {statStrip}
        </div>
      )}
    </div>
  )
}
