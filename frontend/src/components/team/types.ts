export interface PlayerAverages {
  time_played: string
  points: number
  shots_made: number
  three_pts_made: number
  two_pts_in_made: number
  two_pts_out_made: number
  ft_made: number
  fouls: number
}

export interface PlayerTotals {
  time_played: string
  points: number
  shots_made: number
  three_pts_made: number
  two_pts_in_made: number
  two_pts_out_made: number
  ft_made: number
  fouls: number
}

export interface TeamPlayer {
  id: number
  last_name: string
  first_name: string
  gp: number
  starts: number
  fouled_out: number
  averages: PlayerAverages
  totals: PlayerTotals
}

export interface TeamGame {
  id: number
  game_number: string
  date: string
  opponent: string
  home: boolean
  win: boolean
  points: number
  points_against: number
  three_pts_made: number
  ft_made: number
  fouls: number
}

export interface TeamPageData {
  id: number
  name: string
  category: string
  gender: string
  games_played: number
  championships: string[]
  league: { code: string; name: string } | null
  players: TeamPlayer[]
  games: TeamGame[]
}
