import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from "express"
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1'); // version later e.g., api/v1
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strips unknown props
      forbidNonWhitelisted: true, // throw error on extra props
      transform: true,       // transform payloads to DTO instances
    }),
  );
  app.use(cookieParser())

  app.enableCors({
    origin: [
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Only the webhook path uses raw; the rest can use JSON body parser (Nest does it internally)
  app.use('/webhook/rzp', express.raw({ type: 'application/json' }));

  await app.listen(8000, '0.0.0.0');
  console.log('Listening at:', await app.getUrl());
}
bootstrap();