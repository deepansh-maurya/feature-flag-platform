import { Module } from '@nestjs/common';
import { SdkkeysmoduleController } from './interface/sdkkeysmodule.controller';
import { SdkkeysmoduleService } from './application/sdkkeysmodule.service';
import { SdkkeysmoduleRepoToken } from './application/ports/sdkkeysmodule.repo';
import { PrismaSdkkeysmoduleRepo } from './infrastructure/prisma/prisma-sdkkeysmodule.repo';

@Module({
  controllers: [SdkkeysmoduleController],
  providers: [
    SdkkeysmoduleService,
    { provide: SdkkeysmoduleRepoToken, useClass: PrismaSdkkeysmoduleRepo },
  ],
  exports: [SdkkeysmoduleService],
})
export class SdkkeysmoduleModule {}

