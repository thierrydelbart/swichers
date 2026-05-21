import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScoreSheetService } from './score-sheet.service';

@Controller('score-sheet')
export class ScoreSheetController {
  constructor(private readonly scoreSheetService: ScoreSheetService) {}

  @Post('extract')
  @UseGuards(JwtAuthGuard)
  @HttpCode(202)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new BadRequestException('Only PDF files are allowed'), false);
      },
    }),
  )
  async extract(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.scoreSheetService.extract(file.buffer, file.originalname);
  }
}
