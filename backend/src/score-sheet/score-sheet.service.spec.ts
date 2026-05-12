/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ScoreSheetService } from './score-sheet.service';
import { FileService } from '../file/file.service';
import { GamePersistenceService } from '../game-persistence/game-persistence.service';

jest.mock('@anthropic-ai/sdk');

jest.mock('child_process', () => ({
  execFile: jest.fn(
    (
      _cmd: string,
      _args: string[],
      cb: (err: null, out: string, err2: string) => void,
    ) => cb(null, '', ''),
  ),
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('jpeg-bytes')),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const mockCreate = jest.fn();
(Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
  () => ({ messages: { create: mockCreate } }) as unknown as Anthropic,
);

const fixturePdf = fs.readFileSync(
  path.join(__dirname, 'fixtures/resume_0034_PRM_A_77.jpg'),
);

const payload = { competition: { name: 'PRM' }, warnings: [] };

const mockFileService = {
  findByHash: jest.fn(),
  persist: jest.fn(),
  updateExtractedData: jest.fn(),
};

const mockConfigService = { get: jest.fn().mockReturnValue('./uploads') };
const mockGamePersistenceService = { persist: jest.fn() };

describe('ScoreSheetService', () => {
  let service: ScoreSheetService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGamePersistenceService.persist.mockResolvedValue({});
    const module = await Test.createTestingModule({
      providers: [
        ScoreSheetService,
        { provide: FileService, useValue: mockFileService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: GamePersistenceService,
          useValue: mockGamePersistenceService,
        },
      ],
    }).compile();
    service = module.get(ScoreSheetService);
  });

  it('returns cached extractedData without calling Claude', async () => {
    const existing = { id: 1, extractedData: payload };
    mockFileService.findByHash.mockResolvedValue(existing);

    const result = await service.extract(fixturePdf, 'sheet.pdf');

    expect(result).toEqual(payload);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockGamePersistenceService.persist).toHaveBeenCalledWith(
      payload,
      existing,
    );
  });

  it('persists file and calls Claude on cache miss', async () => {
    const file = { id: 2, extractedData: null };
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue(file);
    mockFileService.updateExtractedData.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(payload) }],
    });

    const result = await service.extract(fixturePdf, 'sheet.pdf');

    expect(mockFileService.persist).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
    expect(mockFileService.updateExtractedData).toHaveBeenCalledWith(
      2,
      payload,
    );
    expect(mockGamePersistenceService.persist).toHaveBeenCalledWith(
      payload,
      file,
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

    expect(await service.extract(fixturePdf, 'sheet.pdf')).toEqual(payload);
  });

  it('throws BadGatewayException when Claude API call fails (file still persisted)', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 4, extractedData: null });
    mockCreate.mockRejectedValue(new Error('network error'));

    await expect(service.extract(fixturePdf, 'sheet.pdf')).rejects.toThrow(
      BadGatewayException,
    );
    expect(mockFileService.persist).toHaveBeenCalled();
    expect(mockFileService.updateExtractedData).not.toHaveBeenCalled();
    expect(mockGamePersistenceService.persist).not.toHaveBeenCalled();
  });

  it('throws BadGatewayException when Claude returns invalid JSON', async () => {
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 5, extractedData: null });
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json' }],
    });

    await expect(service.extract(fixturePdf, 'sheet.pdf')).rejects.toThrow(
      BadGatewayException,
    );
    expect(mockGamePersistenceService.persist).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when pdftoppm fails', async () => {
    const { execFile } = jest.requireMock('child_process');
    execFile.mockImplementationOnce(
      (_cmd: string, _args: string[], cb: (err: Error) => void) =>
        cb(new Error('pdftoppm failed')),
    );
    mockFileService.findByHash.mockResolvedValue(null);
    mockFileService.persist.mockResolvedValue({ id: 6, extractedData: null });

    await expect(service.extract(fixturePdf, 'sheet.pdf')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
