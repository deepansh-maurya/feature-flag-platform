import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Authmodule } from './authmodule/authmodule.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [Authmodule, PassportModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
