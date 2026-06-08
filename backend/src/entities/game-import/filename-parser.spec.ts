import { parseFilename } from './filename-parser';

describe('parseFilename', () => {
  it('parses filename with multi-word team names', () => {
    const result = parseFilename(
      'resume_0034_DMU11-3-P2_B_730_CLAPIERS_BASKET_BALL-1_ST_GELY_BASKETBALL-3.pdf',
    );
    expect(result.leagueCode).toBe('0034');
    expect(result.championshipCode).toBe('DMU11-3-P2');
    expect(result.groupName).toBe('B');
    expect(result.gameNumber).toBe('730');
    expect(result.gameName).toBe('CLAPIERS_BASKET_BALL-1_ST_GELY_BASKETBALL-3');
  });

  it('returns null gameName when filename has no team part', () => {
    const result = parseFilename('resume_0034_PRM_A_77.pdf');
    expect(result.gameName).toBeNull();
  });

  it('handles championship code containing dashes', () => {
    const result = parseFilename('resume_0034_PRE-REG-M_C_100_ABC-1_DEF-2.pdf');
    expect(result.championshipCode).toBe('PRE-REG-M');
    expect(result.gameName).toBe('ABC-1_DEF-2');
  });

  it('is case-insensitive for .pdf extension', () => {
    const result = parseFilename(
      'resume_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.PDF',
    );
    expect(result.gameName).toBe('CLAPIERS-1_MONTPELLIER-2');
  });

  it('throws on invalid prefix', () => {
    expect(() =>
      parseFilename('feuille_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.pdf'),
    ).toThrow('Invalid FFBB filename format');
  });
});
