#!/usr/bin/env node
/**
 * Generate a full Nest module scaffold with Clean-Arch-ish folders.
 * Usage:
 *   node scripts/mkmodule.mjs flags
 *   pnpm mkmod:esm flags
 */
import fs from 'node:fs';
import path from 'node:path';

const raw = process.argv[2];
if (!raw) {
  console.error('Usage: pnpm mkmod:esm <module-name>  (e.g., pnpm mkmod:esm flags)');
  process.exit(1);
}

const name = raw.toLowerCase();
const Name = name.charAt(0).toUpperCase() + name.slice(1);
const base = path.join('src', name);

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const writeOnce = (file, content) => {
  if (fs.existsSync(file)) {
    console.log(`skip  - ${file} (exists)`);
  } else {
    fs.writeFileSync(file, content.trimStart() + '\n', 'utf8');
    console.log(`write - ${file}`);
  }
};

[
  `${base}`,
  `${base}/domain`,
  `${base}/application`,
  `${base}/application/ports`,
  `${base}/application/use-cases`,
  `${base}/infrastructure`,
  `${base}/infrastructure/prisma`,
  `${base}/interface`,
  `${base}/interface/dto`,
].forEach(ensureDir);

const modTs = `
import { Module } from '@nestjs/common';
import { ${Name}Controller } from './interface/${name}.controller';
import { ${Name}Service } from './application/${name}.service';
import { ${Name}RepoToken } from './application/ports/${name}.repo';
import { Prisma${Name}Repo } from './infrastructure/prisma/prisma-${name}.repo';

@Module({
  controllers: [${Name}Controller],
  providers: [
    ${Name}Service,
    { provide: ${Name}RepoToken, useClass: Prisma${Name}Repo },
  ],
  exports: [${Name}Service],
})
export class ${Name}Module {}
`;

const controllerTs = `
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ${Name}Service } from '../application/${name}.service';

@Controller('${name}')
export class ${Name}Controller {
  constructor(private readonly svc: ${Name}Service) {}

  @Get()
  async list() {
    return this.svc.list();
  }

  @Post()
  async create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }
}
`;

const serviceTs = `
import { Inject, Injectable } from '@nestjs/common';
import { ${Name}Repo, ${Name}RepoToken } from './ports/${name}.repo';

@Injectable()
export class ${Name}Service {
  constructor(@Inject(${Name}RepoToken) private readonly repo: ${Name}Repo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}
`;

const repoPortTs = `
export const ${Name}RepoToken = Symbol('${Name}Repo');

export interface ${Name}Repo {
  list(): Promise<any[]>;
  get(id: string): Promise<any | null>;
  create(dto: any): Promise<any>;
}
`;

const prismaRepoTs = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ${Name}Repo } from '../../application/ports/${name}.repo';

@Injectable()
export class Prisma${Name}Repo implements ${Name}Repo {
  constructor(private readonly prisma) {}

  async list() { return []; }
  async get(id) { return null; }
  async create(dto) { return dto; }
}
`;

const dtoTs = `
import { IsOptional, IsString } from 'class-validator';

export class Create${Name}Dto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}
`;

const entityTs = `
export class ${Name} {
  constructor(id) { this.id = id; }
}
`;
  
writeOnce(`${base}/${name}.module.ts`, modTs);
writeOnce(`${base}/interface/${name}.controller.ts`, controllerTs);
writeOnce(`${base}/application/${name}.service.ts`, serviceTs);
writeOnce(`${base}/application/ports/${name}.repo.ts`, repoPortTs);
writeOnce(`${base}/infrastructure/prisma/prisma-${name}.repo.ts`, prismaRepoTs);
writeOnce(`${base}/interface/dto/create-${name}.dto.ts`, dtoTs);
writeOnce(`${base}/domain/${name}.entity.ts`, entityTs);

console.log('\n✅ Done. Now import the module in your AppModule (or feature aggregator).');
