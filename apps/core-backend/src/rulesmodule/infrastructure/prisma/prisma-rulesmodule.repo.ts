import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RulesmoduleRepo } from '../../application/ports/rulesmodule.repo';

@Injectable()
export class PrismaRulesmoduleRepo implements RulesmoduleRepo {
  constructor(private readonly prisma) {}

  async list() { return []; }
  async get(id) { return null; }
  async create(dto) { return dto; }
}

