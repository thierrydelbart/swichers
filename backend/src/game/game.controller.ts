import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }
}
