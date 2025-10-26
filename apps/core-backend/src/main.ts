/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
const PROTO_PATH = '../core-backend/proto/cache.proto';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1'); 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true,
    }),
  );
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('Incoming:', req.method, req.url);
    next();
  });

  // Only the webhook path uses raw; the rest can use JSON body parser (Nest does it internally)
  app.use('/webhook/rzp', express.raw({ type: 'application/json' }));

  await app.listen(8000, '0.0.0.0');
  console.log('Listening at:', await app.getUrl());


}
bootstrap();
