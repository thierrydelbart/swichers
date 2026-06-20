/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { API_BASE_URL } from '@/lib/config'

interface AppConfig {
  defaultClubId: number
}

export const ConfigContext = createContext<AppConfig | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/config`)
      .then((res) => res.json() as Promise<AppConfig>)
      .then(setConfig)
      .catch(() => setConfig({ defaultClubId: 1 }))
  }, [])

  if (!config) return null
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
