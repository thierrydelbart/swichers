import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getFirstName: jest.fn().mockResolvedValue('World') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('1') },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('returns firstName from AppService', async () => {
      await expect(appController.getHello()).resolves.toEqual({
        firstName: 'World',
      });
    });
  });
});
