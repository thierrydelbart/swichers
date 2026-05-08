import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { BadGatewayException } from '@nestjs/common';
import { ScoreSheetService } from './score-sheet.service';

jest.mock('@anthropic-ai/sdk');

const mockCreate = jest.fn();
(Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
  () => ({ messages: { create: mockCreate } }) as unknown as Anthropic,
);

const fixtureJpeg = fs.readFileSync(
  path.join(__dirname, 'fixtures/resume_0034_PRM_A_77.jpg'),
);

const validResponse = (json: object) => ({
  content: [{ type: 'text', text: JSON.stringify(json) }],
});

describe('ScoreSheetService', () => {
  let service: ScoreSheetService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ScoreSheetService();
  });

  it('returns parsed JSON from Claude response', async () => {
    const payload = { competition: { name: 'PRM' }, warnings: [] };
    mockCreate.mockResolvedValue(validResponse(payload));

    const result = await service.extract(fixtureJpeg);
    expect(result).toEqual(payload);
  });

  it('strips markdown code fences from Claude response', async () => {
    const payload = { competition: { name: 'PRM' }, warnings: [] };
    mockCreate.mockResolvedValue({
      content: [
        { type: 'text', text: '```json\n' + JSON.stringify(payload) + '\n```' },
      ],
    });

    const result = await service.extract(fixtureJpeg);
    expect(result).toEqual(payload);
  });

  it('throws BadGatewayException when Claude API call fails', async () => {
    mockCreate.mockRejectedValue(new Error('network error'));
    await expect(service.extract(fixtureJpeg)).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('throws BadGatewayException when Claude returns invalid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json at all' }],
    });
    await expect(service.extract(fixtureJpeg)).rejects.toThrow(
      BadGatewayException,
    );
  });
});
