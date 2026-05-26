/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ScoreSheetService } from './score-sheet.service';
import { FileService } from '../file/file.service';
import { GamePersistenceService } from '../game-persistence/game-persistence.service';
import { GameImportService } from '../game-import/game-import.service';
import { GameImportStatus } from '../game-import/game-import-status.enum';

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

const VALID_FILENAME = 'resume_0034_DMU11_A_42_CLAPIERS-1_MONTPELLIER-2.pdf';
const mockFile = { id: 1, hash: 'abc123', location: '/uploads/file.pdf' };
const mockImport = { id: 99, status: GameImportStatus.PENDING };

const mockFileService = {
  findByHash: jest.fn(),
  persist: jest.fn(),
  updateExtractedData: jest.fn(),
};
const mockConfigService = { get: jest.fn().mockReturnValue('./uploads') };
const mockGamePersistenceService = { persist: jest.fn() };
const mockGameImportService = {
  create: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
  findAllPending: jest.fn(),
};

describe('ScoreSheetService', () => {
  let service: ScoreSheetService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGamePersistenceService.persist.mockResolvedValue({ id: 10 });
    mockGameImportService.updateStatus.mockResolvedValue(undefined);
    mockGameImportService.findAllPending.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        ScoreSheetService,
        { provide: FileService, useValue: mockFileService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: GamePersistenceService,
          useValue: mockGamePersistenceService,
        },
        { provide: GameImportService, useValue: mockGameImportService },
      ],
    }).compile();
    service = module.get(ScoreSheetService);
  });

  describe('extract', () => {
    it('throws BadRequestException on invalid FFBB filename', async () => {
      await expect(
        service.extract(fixturePdf, 'random-file.pdf'),
      ).rejects.toThrow(BadRequestException);
      expect(mockFileService.findByHash).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on duplicate file', async () => {
      mockFileService.findByHash.mockResolvedValue({ id: 1 });
      await expect(service.extract(fixturePdf, VALID_FILENAME)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFileService.persist).not.toHaveBeenCalled();
    });

    it('creates GameImport and returns import_id', async () => {
      mockFileService.findByHash.mockResolvedValue(null);
      mockFileService.persist.mockResolvedValue(mockFile);
      mockGameImportService.create.mockResolvedValue(mockImport);

      const result = await service.extract(fixturePdf, VALID_FILENAME);

      expect(result).toEqual({ import_id: 99 });
      expect(mockFileService.persist).toHaveBeenCalled();
      expect(mockGameImportService.create).toHaveBeenCalledWith(
        VALID_FILENAME,
        expect.objectContaining({ gameName: 'CLAPIERS-1_MONTPELLIER-2' }),
        mockFile,
      );
    });
  });

  describe('retry', () => {
    it('throws NotFoundException for unknown import', async () => {
      mockGameImportService.findById.mockResolvedValue(null);
      await expect(service.retry(99)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for non-failed import', async () => {
      mockGameImportService.findById.mockResolvedValue({
        id: 1,
        status: GameImportStatus.PENDING,
        file: mockFile,
      });
      await expect(service.retry(1)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when import has no file', async () => {
      mockGameImportService.findById.mockResolvedValue({
        id: 1,
        status: GameImportStatus.FAILED,
        file: null,
      });
      await expect(service.retry(1)).rejects.toThrow(BadRequestException);
    });

    it('reads file from disk and triggers extraction for failed import', async () => {
      mockGameImportService.findById.mockResolvedValue({
        id: 1,
        status: GameImportStatus.FAILED,
        file: mockFile,
      });

      await expect(service.retry(1)).resolves.toBeUndefined();
    });
  });

  describe('recoverPendingImports', () => {
    it('does nothing when no pending imports', async () => {
      mockGameImportService.findAllPending.mockResolvedValue([]);
      await service.recoverPendingImports();
      expect(mockGameImportService.updateStatus).not.toHaveBeenCalled();
    });

    it('marks as failed when file is missing from disk', async () => {
      const fsMock = jest.requireMock('fs/promises');
      fsMock.readFile.mockRejectedValueOnce(new Error('ENOENT'));
      mockGameImportService.findAllPending.mockResolvedValue([
        { id: 5, status: GameImportStatus.PENDING, file: mockFile },
      ]);

      await service.recoverPendingImports();

      expect(mockGameImportService.updateStatus).toHaveBeenCalledWith(
        5,
        GameImportStatus.FAILED,
        expect.objectContaining({ errorMessage: expect.any(String) }),
      );
    });
  });
});
