import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Authmodule } from './authmodule/authmodule.module';

@Module({
  imports: [Authmodule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
