import { useEffect, useState } from 'react'

export default function Home() {
  const [firstName, setFirstName] = useState<string>('World')

  useEffect(() => {
    fetch('http://localhost:3001/hello')
      .then((res) => res.json())
      .then((data) => setFirstName(data.firstName))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Hello {firstName}</h1>
    </div>
  )
}
