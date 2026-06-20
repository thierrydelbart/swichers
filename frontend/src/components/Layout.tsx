import { Link } from 'react-router-dom'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useAuth } from '@/contexts/useAuth'

function DarkToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <span
        className="relative inline-flex w-9 h-5 rounded-full transition-colors duration-200"
        style={{ background: dark ? '#0055A4' : '#e5e5e5' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: dark ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
      {dark ? 'Mode clair' : 'Mode sombre'}
    </button>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { dark, toggle } = useDarkMode()
  const { token } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex flex-col border-b border-border">
        <div
          className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, #0055A4 0%, #EF4135 100%)' }}
        />
        <div className="flex items-center justify-between px-8 h-14">
          <Link to="/" className="text-[17px] font-bold tracking-tight leading-none">
            <span className="text-[#0055A4] dark:text-[#63a9f6]">Swi</span>
            <span style={{ color: '#EF4135' }}>chers</span>
          </Link>
          {token && (
            <Link
              to="/admin"
              className="text-[13px] font-semibold text-white px-3.5 py-1.5 rounded"
              style={{ background: '#0055A4' }}
            >
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1" style={{minWidth: 640}}>
        {children}
      </main>

      <footer className="flex items-center justify-between px-8 h-13 border-t border-border text-xs">
        <DarkToggle dark={dark} toggle={toggle} />
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            En savoir plus sur Swichers
          </Link>
          <a
            href="https://competitions.ffbb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            competitions.ffbb.com →
          </a>
        </div>
      </footer>
    </div>
  )
}
