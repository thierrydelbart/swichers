export interface PlayerStat {
  number: number
  last_name: string
  first_name: string
  starter: boolean
  time_played: string | null
  points: number
  shots_made: number
  three_pts_made: number
  two_pts_in_made: number
  two_pts_out_made: number
  ft_made: number
  fouls: number
}

export interface TotalStat {
  points: number
  fouls: number
  three_pts_made: number
  ft_made: number
}

export interface Totals {
  team: TotalStat
  starters: TotalStat
  bench: TotalStat
  first_half: TotalStat
  second_half: TotalStat
  overtime: TotalStat
}

export interface TeamData {
  team_id: number
  name: string
  players: PlayerStat[]
  totals: Totals
  coach: { name: string; fouls: number } | null
}

export interface GameData {
  id: number
  game_number: string
  date: string
  time: string
  venue: string
  group: string
  championship: { name: string; season: string | null }
  referees: string[]
  home: TeamData
  away: TeamData
}
