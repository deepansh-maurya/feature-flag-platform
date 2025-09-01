    import { Global, Injectable, Module } from "@nestjs/common";
    import PrismaService from "./prisma.service";

    @Global()
    @Module({
        providers: [PrismaService],
        exports: [PrismaService]
    })

    export default class PrismaModule { }  