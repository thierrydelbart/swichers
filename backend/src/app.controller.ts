import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService,
  ) {}

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('hello')
  async getHello(): Promise<{ firstName: string }> {
    const firstName = await this.appService.getFirstName();
    return { firstName };
  }

  @Get('config')
  getConfig() {
    return {
      defaultClubId: Number(this.config.get<string>('DEFAULT_CLUB_ID') ?? 1),
    };
  }
}
