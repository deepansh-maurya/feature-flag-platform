import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from "express"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // version later e.g., api/v1
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strips unknown props
      forbidNonWhitelisted: true, // throw error on extra props
      transform: true,       // transform payloads to DTO instances
    }),
  );
  // Only the webhook path uses raw; the rest can use JSON body parser (Nest does it internally)
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  await app.listen(8000);
}
bootstrap();
