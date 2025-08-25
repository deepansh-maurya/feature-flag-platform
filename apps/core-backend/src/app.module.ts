import { Module } from '@nestjs/common';
import { Authmodule } from './authmodule/authmodule.module';
import { PassportModule } from '@nestjs/passport';
import { AnalyticsmoduleModule } from './analyticsmodule/analyticsmodule.module';
import { AuditModule } from './adminmodule/adminmodule.module';
import { BillingmoduleModule } from './billingmodule/billingmodule.module';
import { ChangeRequestModule } from './changerequestsmodule/changerequestsmodule.module';
import { FlagsmoduleModule } from './flagsmodule/flagsmodule.module';
import { ProjectmoduleModule } from './projectmodule/projectmodule.module';
import { UserModule } from './usersmodule/usersmodule.module';
import { WorkspacesmoduleModule } from './workspacesmodule/workspacesmodule.module';

@Module({
  imports: [
    Authmodule,
    PassportModule,
    AnalyticsmoduleModule,
    AuditModule,
    BillingmoduleModule,
    ChangeRequestModule,
    FlagsmoduleModule,
    ProjectmoduleModule,
    UserModule,
    WorkspacesmoduleModule,
  ],
})
export class AppModule {}
