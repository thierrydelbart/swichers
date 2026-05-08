import { ScoreSheetService } from './score-sheet.service';

describe('ScoreSheetService', () => {
  let service: ScoreSheetService;

  beforeEach(() => {
    service = new ScoreSheetService();
  });

  it('returns received:true with the buffer size', () => {
    const buf = Buffer.from('fake-jpeg-data');
    expect(service.extract(buf)).toEqual({ received: true, size: buf.length });
  });
});
