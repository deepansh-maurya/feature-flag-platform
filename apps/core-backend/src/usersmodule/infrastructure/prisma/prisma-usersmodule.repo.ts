import { Injectable } from '@nestjs/common';
import PrismaService from 'src/infra/prisma/prisma.service';
import { CreateUserDto, GetUserByEmailDto, SoftDeleteUserDto, UpdateUserDto, UserDto } from '../../interface/dto/create-usersmodule.dto'
import { UserRepo } from 'src/usersmodule/application/ports/usersmodule.repo';
import { UserStatus } from '@prisma/client'

@Injectable()
export class PrismaUserRepository implements UserRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.upsert({
      where: { email: input.email },
      update: {
        // if user exists (invited → becomes active), only set missing fields
        name: input.name ?? undefined,
        passwordHash: input.passwordHash ?? undefined,
        externalIdp: input.externalIdp ?? undefined,
        status: input.status ?? undefined,
        isDeleted: false,
      },
      create: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash ?? null,
        externalIdp: input.externalIdp ?? null,
        status: input.status ?? UserStatus.invited,
      },
    });
    return this.toDto(user);
  }

  async findById(id: string): Promise<UserDto | null> {
    const u = await this.prisma.user.findFirst({ where: { id } });
    return u ? this.toDto(u) : null;
  }

  async findByEmail(input: GetUserByEmailDto): Promise<UserDto | null> {
    const u = await this.prisma.user.findUnique({ where: { email: input.email } });
    return u ? this.toDto(u) : null;
  }

  async updateUser(input: UpdateUserDto): Promise<UserDto> {
    const u = await this.prisma.user.update({
      where: { id: input.id },
      data: {
        name: input.name ?? undefined,
        status: input.status ?? undefined,
        externalIdp: input.externalIdp ?? undefined,
        passwordHash: input.passwordHash ?? undefined,
      },
    });
    return this.toDto(u);
  }

  async softDeleteUser(input: SoftDeleteUserDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: input.id },
      data: { isDeleted: true, status: UserStatus.invited }, // or keep previous; your call
    });
  }

  /* ---------- mapper ---------- */
  private toDto(u: any): UserDto {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      passwordHash: u.passwordHash ?? null,
      externalIdp: u.externalIdp ?? null,
      status: u.status,
      isDeleted: u.isDeleted,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
