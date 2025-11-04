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
import { Auditmodule } from './auditmodule/auditmodule.module';
import PrismaModule from './infra/prisma/prisma.module';
import { RulesmoduleModule } from './rulesmodule/rulesmodule.module';
import { ConfigModule } from '@nestjs/config';





@Module({
  imports: [
    Authmodule,
    PassportModule,
    AnalyticsmoduleModule,
    Auditmodule,
    BillingModule,
    ChangeRequestModule,
    FlagsmoduleModule,
    ProjectmoduleModule,
    UserModule,
    WorkspacesmoduleModule,
    PrismaModule,
    RulesmoduleModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

