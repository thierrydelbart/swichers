import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/useAuth'
import { API_BASE_URL } from '@/lib/config'

function LoginForm() {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)
    try {
      await login(password)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-8 space-y-6 bg-background shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Administration</h1>
          <p className="text-sm text-muted-foreground">Accès réservé.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">Mot de passe incorrect.</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function UploadSection({ onImported }: { onImported: () => void }) {
  const { token } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (f && f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/score-sheet/extract`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? 'Extraction failed')
      }
      toast.success('Résumé importé, extraction en cours…')
      setFile(null)
      ;(e.target as HTMLFormElement).reset()
      onImported()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Importer un résumé de match
      </p>
      <form onSubmit={handleSubmit} className="flex items-center gap-4 max-w-lg border border-dashed border-border rounded-lg px-5 py-4 bg-muted/40">
        <div className="space-y-1.5 flex-1">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="max-w-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Le fichier doit être le résumé de match officiel FFBB
            (format&nbsp;: <code className="font-mono">resume_&lt;code&gt;_….pdf</code>)
          </p>
        </div>
        <Button type="submit" disabled={!file || loading} size="sm">
          {loading ? 'Import en cours…' : 'Importer'}
        </Button>
      </form>
    </div>
  )
}

interface GameImportItem {
  id: number
  status: 'pending' | 'ready' | 'failed'
  error_message: string | null
  filename: string
  game_name: string | null
  game: { id: number } | null
  created_at: string
  extraction_started_at: string | null
}

function statusBadge(status: GameImportItem['status']) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        En cours
      </span>
    )
  }
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
        Importé
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
      Échec
    </span>
  )
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ImportsSection({ refreshKey, token }: { refreshKey: number; token: string }) {
  const [imports, setImports] = useState<GameImportItem[]>([])
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set())
  const scheduledFadeRef = useRef<Set<number>>(new Set())
  const [retrying, setRetrying] = useState<number | null>(null)

  const fetchImports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/game-imports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = (await res.json()) as GameImportItem[]
      setImports(data)
    } catch {
      // silently ignore polling errors
    }
  }

  useEffect(() => {
    void fetchImports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  useEffect(() => {
    const hasPending = imports.some((i) => i.status === 'pending')
    if (!hasPending) return
    const id = setInterval(() => void fetchImports(), 5000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imports])

  useEffect(() => {
    imports.forEach((imp) => {
      if (imp.status === 'ready' && !scheduledFadeRef.current.has(imp.id)) {
        scheduledFadeRef.current.add(imp.id)
        setTimeout(() => {
          setHiddenIds((prev) => new Set([...prev, imp.id]))
        }, 3000)
      }
    })
  }, [imports])

  const handleRetry = async (id: number) => {
    setRetrying(id)
    try {
      const res = await fetch(`${API_BASE_URL}/game-imports/${id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.success('Relance de l\'extraction…')
      await fetchImports()
    } catch {
      toast.error('Erreur lors de la relance')
    } finally {
      setRetrying(null)
    }
  }

  const visible = imports.filter((i) => !hiddenIds.has(i.id))

  if (visible.length === 0) return null

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Imports en cours
      </p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left border-b border-border">Équipes</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Statut</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Extraction démarrée</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Erreur</th>
              <th className="px-4 py-2.5 text-right border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((imp) => {
              return (
                <tr key={imp.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {imp.game_name?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(imp.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">
                    {imp.extraction_started_at ? formatDateTime(imp.extraction_started_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-destructive max-w-xs truncate">
                    {imp.error_message ?? ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {imp.status === 'ready' && imp.game && (
                      <Link to={`/games/${imp.game.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                          Voir le match
                        </Button>
                      </Link>
                    )}
                    {imp.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5"
                        onClick={() => void handleRetry(imp.id)}
                        disabled={retrying === imp.id}
                      >
                        {retrying === imp.id ? 'Relance…' : 'Réessayer'}
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface GameListItem {
  id: number
  date: string
  team_a: { id: number; name: string; suffix: string | null }
  team_b: { id: number; name: string; suffix: string | null }
  score_a: number
  score_b: number
  championship: string
  file_id: number | null
}

interface GamesResponse {
  data: GameListItem[]
  total: number
  page: number
  pageSize: number
}

function teamName(t: { name: string; suffix: string | null }) {
  return t.suffix ? `${t.name} ${t.suffix}` : t.name
}

function GamesSection() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<GamesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 300)
  }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    fetch(`${API_BASE_URL}/games?${params.toString()}`)
      .then((r) => r.json() as Promise<GamesResponse>)
      .then(setResult)
      .catch(() => toast.error('Failed to load games'))
      .finally(() => setLoading(false))
  }, [debouncedSearch, page])

  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 1

  const handleDelete = async () => {
    if (confirmId === null) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/games/${confirmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Match supprimé')
      setConfirmId(null)
      setResult((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((g) => g.id !== confirmId), total: prev.total - 1 }
          : prev,
      )
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Matchs
      </p>

      <div className="flex items-center justify-between mb-4 gap-4">
        <Input
          placeholder="Rechercher par équipe…"
          value={search}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
        {result && (
          <span className="text-sm text-muted-foreground">
            {result.total} match{result.total !== 1 ? 's' : ''} · page {page}/{totalPages}
          </span>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left border-b border-border">Date</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Domicile</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Extérieur</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Score</th>
              <th className="px-4 py-2.5 text-left border-b border-border">Compétition</th>
              <th className="px-4 py-2.5 text-right border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            ) : result?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun match trouvé.
                </td>
              </tr>
            ) : (
              result?.data.map((g) => (
                <tr key={g.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{g.date}</td>
                  <td className="px-4 py-3">
                    <Link to={`/teams/${g.team_a.id}`} className="hover:underline font-medium">
                      {teamName(g.team_a)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/teams/${g.team_b.id}`} className="hover:underline font-medium">
                      {teamName(g.team_b)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/games/${g.id}`} className="font-bold tabular-nums hover:underline whitespace-nowrap">
                      {g.score_a} – {g.score_b}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{g.championship}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {g.file_id !== null && (
                        <a
                          href={`${API_BASE_URL}/files/${g.file_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                            PDF
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => setConfirmId(g.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {result && `${(page - 1) * result.pageSize + 1}–${Math.min(page * result.pageSize, result.total)} sur ${result.total}`}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 px-3">
              ←
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 px-3">
              →
            </Button>
          </div>
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-sm shadow-lg space-y-4">
            <h2 className="font-bold text-base">Supprimer ce match ?</h2>
            <p className="text-sm text-muted-foreground">
              Cette action supprimera définitivement le match et le fichier PDF associé. Elle est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmId(null)} disabled={deleting}>
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  if (!token) return <LoginForm />

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
      <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
      <UploadSection onImported={() => setRefreshKey((k) => k + 1)} />
      <ImportsSection refreshKey={refreshKey} token={token} />
      <GamesSection />
    </div>
  )
}
