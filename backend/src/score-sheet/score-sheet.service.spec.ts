import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ScoreSheetService } from './score-sheet.service';
import { FileService } from '../file/file.service';

jest.mock('@anthropic-ai/sdk');

const mockCreate = jest.fn();
(Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
  () => ({ messages: { create: mockCreate } }) as unknown as Anthropic,
);

const fixtureJpeg = fs.readFileSync(
  path.join(__dirname, 'fixtures/resume_0034_PRM_A_77.jpg'),
);

const payload = { competition: { name: 'PRM' }, warnings: [] };

const mockFileService = {
  findByHash: jest.fn(),
  persist: jest.fn(),
  updateExtractedData: jest.fn(),
};

const mockConfigService = { get: jest.fn().mockReturnValue('./uploads') };

describe('ScoreSheetService', () => {
  let service: ScoreSheetService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ScoreSheetService,
        { provide: FileService, useValue: mockFileService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get(ScoreSheetService);
  });

  it('returns cached extractedData without calling Claude', async () => {
    mockFileService.findByHash.mockResolvedValue({
      id: 1,
      extractedData: payload,
    });

    const result = await service.extract(fixtureJpeg, 'sheet.jpg');

    expect(result).toEqual(payload);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('persists file and calls Claude on cache miss', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 2, extractedData: null });
    mockFileService.updateExtractedData.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(payload) }],
    });

    const result = await service.extract(fixtureJpeg, 'sheet.jpg');

    expect(mockFileService.persist).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
    expect(mockFileService.updateExtractedData).toHaveBeenCalledWith(
      2,
      payload,
    );
    expect(result).toEqual(payload);
  });

  it('strips markdown code fences from Claude response', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 3, extractedData: null });
    mockFileService.updateExtractedData.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      content: [
        { type: 'text', text: '```json\n' + JSON.stringify(payload) + '\n```' },
      ],
    });

    expect(await service.extract(fixtureJpeg, 'sheet.jpg')).toEqual(payload);
  });

  it('throws BadGatewayException when Claude API call fails (file still persisted)', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 4, extractedData: null });
    mockCreate.mockRejectedValue(new Error('network error'));

    await expect(service.extract(fixtureJpeg, 'sheet.jpg')).rejects.toThrow(
      BadGatewayException,
    );
    expect(mockFileService.persist).toHaveBeenCalled();
    expect(mockFileService.updateExtractedData).not.toHaveBeenCalled();
  });

  it('throws BadGatewayException when Claude returns invalid JSON', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 5, extractedData: null });
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json' }],
    });

    await expect(service.extract(fixtureJpeg, 'sheet.jpg')).rejects.toThrow(
      BadGatewayException,
    );
  });
});
