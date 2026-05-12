import * as fs from 'fs/promises';
import * as path from 'path';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { FileService } from './file.service';
import { File } from './file.entity';

jest.mock('fs/promises');

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: getRepositoryToken(File), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(FileService);
  });

  it('findByHash returns null when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    expect(await service.findByHash('abc')).toBeNull();
  });

  it('persist creates dir, writes file, and saves record', async () => {
    const buf = Buffer.from('data');
    const saved = {
      id: 1,
      name: 'sheet.pdf',
      location: '/uploads/abc.pdf',
      hash: 'abc',
      extractedData: null,
    };
    mockRepo.create.mockReturnValue(saved);
    mockRepo.save.mockResolvedValue(saved);

    const result = await service.persist('sheet.pdf', 'abc', '/uploads', buf);

    expect(fs.mkdir).toHaveBeenCalledWith('/uploads', { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join('/uploads', 'abc.pdf'),
      buf,
    );
    expect(result).toEqual(saved);
  });

  it('updateExtractedData calls repository update', async () => {
    mockRepo.update.mockResolvedValue({});
    await service.updateExtractedData(1, { competition: { name: 'PRM' } });
    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      extractedData: { competition: { name: 'PRM' } },
    });
  });
});
