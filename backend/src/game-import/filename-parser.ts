export interface ParsedFilename {
  leagueCode: string;
  championshipCode: string;
  groupName: string;
  gameNumber: string;
  gameName: string | null;
}

export function parseFilename(filename: string): ParsedFilename {
  const base = filename.replace(/\.pdf$/i, '');
  const tokens = base.split('_');

  if (tokens[0] !== 'resume' || tokens.length < 5) {
    throw new Error(`Invalid FFBB filename format: ${filename}`);
  }

  const [
    ,
    leagueCode,
    championshipCode,
    groupName,
    gameNumber,
    ...gameNameParts
  ] = tokens;
  const gameName = gameNameParts.length > 0 ? gameNameParts.join('_') : null;

  return { leagueCode, championshipCode, groupName, gameNumber, gameName };
}
