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

export interface TeamPlayer {
  id: number
  last_name: string
  first_name: string
  gp: number
  starts: number
  fouled_out: number
  averages: PlayerAverages
}

export interface TeamPageData {
  id: number
  name: string
  category: string
  gender: string
  games_played: number
  championships: string[]
  players: TeamPlayer[]
}
