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

  const port = process.env.PORT || 4003;
  await app.listen(port);
  logger.log(`Microservice ms-notifications is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
