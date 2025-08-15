import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SdkkeysmoduleRepo } from '../../application/ports/sdkkeysmodule.repo';

@Injectable()
export class PrismaSdkkeysmoduleRepo implements SdkkeysmoduleRepo {
  constructor(private readonly prisma) {}

  async list() { return []; }
  async get(id) { return null; }
  async create(dto) { return dto; }
}

