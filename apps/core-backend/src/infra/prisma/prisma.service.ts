import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "generated/prisma";

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