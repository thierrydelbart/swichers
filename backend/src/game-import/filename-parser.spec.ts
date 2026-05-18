import { parseFilename } from './filename-parser';

describe('parseFilename', () => {
  it('parses standard multi-word team names', () => {
    const result = parseFilename(
      'resume_0034_DMU11-3-P2_B_730_CLAPIERS_BASKET_BALL-1_ST_GELY_BASKETBALL-3.pdf',
    );
    expect(result.leagueCode).toBe('0034');
    expect(result.championshipCode).toBe('DMU11-3-P2');
    expect(result.groupName).toBe('B');
    expect(result.gameNumber).toBe('730');
    expect(result.teamAName).toBe('CLAPIERS BASKET BALL');
    expect(result.teamASuffix).toBe('1');
    expect(result.teamBName).toBe('ST GELY BASKETBALL');
    expect(result.teamBSuffix).toBe('3');
  });

  it('parses single-word team names', () => {
    const result = parseFilename(
      'resume_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.pdf',
    );
    expect(result.teamAName).toBe('CLAPIERS');
    expect(result.teamASuffix).toBe('1');
    expect(result.teamBName).toBe('MONTPELLIER');
    expect(result.teamBSuffix).toBe('2');
  });

  it('handles championship code containing dashes', () => {
    const result = parseFilename('resume_0034_PRE-REG-M_C_100_ABC-1_DEF-2.pdf');
    expect(result.championshipCode).toBe('PRE-REG-M');
    expect(result.teamAName).toBe('ABC');
    expect(result.teamASuffix).toBe('1');
  });

  it('handles suffix 0', () => {
    const result = parseFilename(
      'resume_0034_DMU11_A_42_CLAPIERS-0_MONTPELLIER-1.pdf',
    );
    expect(result.teamASuffix).toBe('0');
    expect(result.teamBSuffix).toBe('1');
  });

  it('is case-insensitive for .pdf extension', () => {
    const result = parseFilename(
      'resume_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.PDF',
    );
    expect(result.teamAName).toBe('CLAPIERS');
  });

  it('throws on invalid prefix', () => {
    expect(() =>
      parseFilename('feuille_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.pdf'),
    ).toThrow('Invalid FFBB filename format');
  });

  it('throws when team_b is missing', () => {
    expect(() =>
      parseFilename('resume_0034_DMU11_A_42_CLAPIERS-1.pdf'),
    ).toThrow();
  });
});
