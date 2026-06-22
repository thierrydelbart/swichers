import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ClubService } from './club.service';

@Controller('clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clubService.findById(id);
  }

  @Get(':id/news')
  findNews(
    @Param('id', ParseIntPipe) id: number,
    @Query('teamId') teamId?: string,
    @Query('category') category?: string,
  ) {
    return this.clubService.findNews(
      id,
      teamId ? parseInt(teamId, 10) : undefined,
      category ?? undefined,
    );
  }
}
