import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma/edge";
import { Prisma } from "generated/prisma";
//import { prisma, PrismaClient } from "generated/prisma";

@Injectable()
export default class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}

export type PrismaTx = PrismaClient | Prisma.TransactionClient;