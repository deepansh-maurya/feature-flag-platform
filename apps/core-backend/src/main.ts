import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strips unknown props
      forbidNonWhitelisted: true, // throw error on extra props
      transform: true,       // transform payloads to DTO instances
    }),
  );

  await app.listen(8000);
}
bootstrap();
