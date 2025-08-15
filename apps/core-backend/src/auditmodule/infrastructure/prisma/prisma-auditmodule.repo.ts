import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditmoduleRepo } from '../../application/ports/auditmodule.repo';

@Injectable()
export class PrismaAuditmoduleRepo implements AuditmoduleRepo {
  constructor(private readonly prisma) {}

  async list() { return []; }
  async get(id) { return null; }
  async create(dto) { return dto; }
}

