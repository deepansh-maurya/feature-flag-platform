import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthmoduleRepo } from '../../application/ports/authmodule.repo';

@Injectable()
export class PrismaAuthmoduleRepo implements AuthmoduleRepo {
  constructor(private readonly prisma) {}

  async list() { return []; }
  async get(id) { return null; }
  async create(dto) { return dto; }
}

