import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Upload from '@/pages/Upload'
import Game from '@/pages/Game'
import Team from '@/pages/Team'
import About from '@/pages/About'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/games/:id" element={<Game />} />
          <Route path="/teams/:id" element={<Team />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}
