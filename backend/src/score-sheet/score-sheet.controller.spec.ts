import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';

const mockFile = (mimetype = 'image/jpeg', size = 100): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'sheet.jpg',
    encoding: '7bit',
    mimetype,
    buffer: Buffer.alloc(size),
    size,
  }) as Express.Multer.File;

describe('ScoreSheetController', () => {
  let controller: ScoreSheetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])],
      controllers: [ScoreSheetController],
      providers: [ScoreSheetService],
    }).compile();

    controller = module.get(ScoreSheetController);
  });

  it('returns extraction result for a valid JPEG', async () => {
    const file = mockFile();
    const result = await controller.extract(file);
    expect(result).toEqual({ received: true, size: 100 });
  });

  it('throws BadRequestException when no file provided', async () => {
    await expect(
      controller.extract(undefined as unknown as Express.Multer.File),
    ).rejects.toThrow(BadRequestException);
  });
});
