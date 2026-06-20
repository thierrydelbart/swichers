import Club from '@/pages/Club'
import { useConfig } from '@/contexts/useConfig'

export default function Home() {
  const { defaultClubId } = useConfig()
  return <Club clubId={defaultClubId} />
}
