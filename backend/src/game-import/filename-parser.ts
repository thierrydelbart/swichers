export interface ParsedFilename {
  leagueCode: string;
  championshipCode: string;
  groupName: string;
  gameNumber: string;
  teamAName: string;
  teamASuffix: string | null;
  teamBName: string;
  teamBSuffix: string | null;
}

export function parseFilename(filename: string): ParsedFilename {
  const base = filename.replace(/\.pdf$/i, '');
  const tokens = base.split('_');

  if (tokens[0] !== 'resume' || tokens.length < 7) {
    throw new Error(`Invalid FFBB filename format: ${filename}`);
  }

  const [, leagueCode, championshipCode, groupName, gameNumber, ...teamParts] =
    tokens;

  // Find team_a boundary: accumulate tokens until string ends with -<digits>
  const teamATokens: string[] = [];
  let splitAt = -1;

  for (let i = 0; i < teamParts.length; i++) {
    teamATokens.push(teamParts[i]);
    if (/-\d+$/.test(teamATokens.join('_'))) {
      splitAt = i;
      break;
    }
  }

  if (splitAt === -1) {
    throw new Error(`Cannot find team_a boundary in filename: ${filename}`);
  }

  const teamBTokens = teamParts.slice(splitAt + 1);

  if (teamBTokens.length === 0) {
    throw new Error(`Cannot find team_b in filename: ${filename}`);
  }

  const { name: teamAName, suffix: teamASuffix } = splitTeam(
    teamATokens.join('_'),
  );
  const { name: teamBName, suffix: teamBSuffix } = splitTeam(
    teamBTokens.join('_'),
  );

  return {
    leagueCode,
    championshipCode,
    groupName,
    gameNumber,
    teamAName,
    teamASuffix,
    teamBName,
    teamBSuffix,
  };
}

function splitTeam(teamStr: string): { name: string; suffix: string | null } {
  const lastDash = teamStr.lastIndexOf('-');
  if (lastDash !== -1) {
    const potentialSuffix = teamStr.slice(lastDash + 1);
    if (/^\d+$/.test(potentialSuffix)) {
      return {
        name: teamStr.slice(0, lastDash).replace(/_/g, ' '),
        suffix: potentialSuffix,
      };
    }
  }
  return { name: teamStr.replace(/_/g, ' '), suffix: null };
}
