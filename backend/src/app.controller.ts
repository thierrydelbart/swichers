import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('hello')
  async getHello(): Promise<{ firstName: string }> {
    const firstName = await this.appService.getFirstName();
    return { firstName };
  }
}
