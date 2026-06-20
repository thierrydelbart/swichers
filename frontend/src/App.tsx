import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Club from '@/pages/Club'
import Admin from '@/pages/Admin'
import Game from '@/pages/Game'
import Team from '@/pages/Team'
import About from '@/pages/About'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <ConfigProvider>
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/club/:id" element={<Club />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/games/:id" element={<Game />} />
          <Route path="/teams/:id" element={<Team />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
      <Toaster />
    </AuthProvider>
    </ConfigProvider>
  )
}
