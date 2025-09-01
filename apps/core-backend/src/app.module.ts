import { Module } from '@nestjs/common';
import { Authmodule } from './authmodule/authmodule.module';
import { PassportModule } from '@nestjs/passport';
import { AnalyticsmoduleModule } from './analyticsmodule/analyticsmodule.module';
import { ChangeRequestModule } from './changerequestsmodule/changerequestsmodule.module';
import { FlagsmoduleModule } from './flagsmodule/flagsmodule.module';
import { ProjectmoduleModule } from './projectmodule/projectmodule.module';
import { UserModule } from './usersmodule/usersmodule.module';
import { WorkspacesmoduleModule } from './workspacesmodule/workspacesmodule.module';
import { BillingModule } from './billingmodule/billingmodule.module';
import { JwtAuthGuard } from './authmodule/infrastructure/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    Authmodule,
    PassportModule,
    AnalyticsmoduleModule,
    // AuditModule,
    BillingModule,
    ChangeRequestModule,
    FlagsmoduleModule,
    ProjectmoduleModule,
    UserModule,
    WorkspacesmoduleModule,
  ],
  providers:[
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ]
})
export class AppModule {}
