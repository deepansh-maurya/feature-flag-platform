import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import * as bcrypt from "bcrypt";
import { BCRYPT_ROUNDS } from 'src/authmodule/infrastructure/prisma/prisma-authmodule.repo';

@Injectable()
export default class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

export const prismaService = new PrismaService()