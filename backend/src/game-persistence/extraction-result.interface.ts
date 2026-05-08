export interface ExtractionResult {
  competition: {
    name: string;
    short_code: string | null;
    season: string;
    category: string;
    gender: string;
  };
  teams: {
    home: { name: string; suffix: string | null };
    away: { name: string; suffix: string | null };
  };
  game_info: {
    game_number: number;
    date: string;
    time: string;
    venue: string;
    group: string;
    referees: {
      first: string | null;
      second: string | null;
      third: string | null;
    };
  };
  stats: {
    home: { players: PlayerRow[]; totals: TeamTotals; coach: CoachRow };
    away: { players: PlayerRow[]; totals: TeamTotals; coach: CoachRow };
  };
  warnings: string[];
}

export interface PlayerRow {
  number: number;
  last_name: string;
  first_name: string;
  starter: boolean;
  time_played: string | null;
  points: number;
  shots_made: number;
  '3pts_made': number;
  '2pts_in_made': number;
  '2pts_out_made': number;
  FT_made: number;
  fouls: number;
}

export interface TeamTotals {
  team: StatRow;
  bench: StatRow;
  starters: StatRow;
  first_half: StatRow;
  second_half: StatRow;
  overtime: StatRow;
}

export interface StatRow {
  time_played: string | null;
  points: number;
  shots_made: number;
  '3pts_made': number;
  '2pts_in_made': number;
  '2pts_out_made': number;
  FT_made: number;
  fouls: number;
}

export interface CoachRow {
  name: string | null;
  fouls: number;
}
