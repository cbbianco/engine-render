import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors();
  
  // Prefijo global
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4004;
  await app.listen(port);
  logger.log(`Microservice ms-inventory is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
