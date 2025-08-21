import { Module } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import { USER_REPO } from './application/ports/usersmodule.repo';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-usersmodule.repo';
import { UserService } from './application/use-cases/usersmodule.service';
import { UserController } from './interface/usersmodule.controller';

@Module({
  providers: [
    PrismaService,
    { provide: USER_REPO, useClass: PrismaUserRepository },
    UserService,
  ],
  controllers: [UserController],
  exports: [UserService, USER_REPO], // so Auth module can call create/find
})
export class UserModule {}
