import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ClubService } from './club.service';

@Controller('clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clubService.findById(id);
  }
}
