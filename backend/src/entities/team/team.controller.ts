import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findByClub(@Query('club') club: string) {
    return this.teamService.findByClub(club);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.findOne(id);
  }
}
