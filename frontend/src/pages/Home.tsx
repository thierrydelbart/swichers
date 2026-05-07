import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.API_URL ?? 'http://localhost:3001'

export default function Home() {
  const [firstName, setFirstName] = useState<string>('World')

  useEffect(() => {
    fetch(`${API_BASE_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setFirstName(data.firstName))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Erreur réseau'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Hello {firstName}</h1>
    </div>
  )
}
