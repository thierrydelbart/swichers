import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (f && f.type !== 'image/jpeg') {
      toast.error('Only JPEG files are allowed')
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
    setResult(null)
    try {
      const res = await fetch(`${API_BASE_URL}/score-sheet/extract`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? 'Extraction failed')
      }
      const data: unknown = await res.json()
      setResult(JSON.stringify(data, null, 2))
      toast.success('Extraction successful')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Upload FFBB Score Sheet</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium">
            Score sheet (JPEG)
          </label>
          <Input
            id="file"
            type="file"
            accept="image/jpeg"
            onChange={handleFileChange}
          />
        </div>
        <Button type="submit" disabled={!file || loading}>
          {loading ? 'Extracting…' : 'Extract'}
        </Button>
      </form>
      {result && (
        <pre className="bg-muted rounded-md p-4 text-sm overflow-auto">
          {result}
        </pre>
      )}
    </main>
  )
}
