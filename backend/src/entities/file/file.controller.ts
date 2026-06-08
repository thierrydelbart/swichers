import * as fs from 'fs';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.fileService.findById(id);
    if (!file) throw new NotFoundException(`File #${id} not found`);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${file.name}"`,
    });
    fs.createReadStream(file.location).pipe(res);
  }
}
