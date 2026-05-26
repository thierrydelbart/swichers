/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { API_BASE_URL } from '@/lib/config'
const STORAGE_KEY = 'admin_token'

export interface AuthContextValue {
  token: string | null
  login: (password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(STORAGE_KEY),
  )

  async function login(password: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) throw new Error('Invalid password')
    const data = (await res.json()) as { access_token: string }
    sessionStorage.setItem(STORAGE_KEY, data.access_token)
    setToken(data.access_token)
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

