import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlagsModule } from './flags/flags.module';

@Module({
  imports: [FlagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
