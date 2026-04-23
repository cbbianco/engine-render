import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env desde la raíz de la app, apps/ o la raíz del monorepo
dotenv.config(); // Por defecto
dotenv.config({ path: path.join(process.cwd(), '../.env') }); // apps/.env
dotenv.config({ path: path.join(process.cwd(), '../../.env') }); // root/.env

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap().then();
