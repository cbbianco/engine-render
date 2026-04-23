import { Test, TestingModule } from '@nestjs/testing';
import { ModuleController } from './module.controller';
import { ModuleGenerateService } from '../service/generate/module-generate.service';

describe('AppController', () => {
  let appController: ModuleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ModuleController],
      providers: [ModuleGenerateService],
    }).compile();

    appController = app.get<ModuleController>(ModuleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
