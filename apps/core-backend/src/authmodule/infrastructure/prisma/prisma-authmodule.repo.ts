import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthmoduleRepo } from '../../application/ports/authmodule.repo';
import { AuthEntity } from 'src/authmodule/domain/authmodule.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import PrismaService from 'src/infra/prisma/prisma.service';
import {
  WorkspacesmoduleRepo,
  WorkspacesmoduleRepoToken,
} from 'src/workspacesmodule/application/ports/workspacesmodule.repo';
import { BillingStatus, RoleKey, User, Workspace } from 'generated/prisma';

export const BCRYPT_ROUNDS = 12;

/**
 * Utility: hash any secret/token with a cryptographic hash (not reversible).
 * Use for refresh tokens so we never store the raw token.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class PrismaAuthmoduleRepo implements AuthmoduleRepo {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WorkspacesmoduleRepoToken)
    private readonly workspace: WorkspacesmoduleRepo,
  ) {}

  /**
   * Register a user.
   * - Ensures unique email
   * - Hashes password
   */
  async register(user: AuthEntity): Promise<{ id: string; wid: string }> {
    const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    return await this.prisma.$transaction(async (tx) => {
      const email = user.email?.trim().toLowerCase();
      if (!email || !user.password) {
        throw new BadRequestException('Email and password are required.');
      }

      const existing = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing) {
        throw new BadRequestException('Email already in use.');
      }

      const dbuser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: user.fullName!,
          status: 'active',
        },
      });

      const dbWorkspace = await this.workspace.create(
        { name: user.workspace!, ownerUserId: dbuser.id },
        tx,
      );

      await this.workspace.addMember(
        {
          workspaceId: dbWorkspace.id,
          role: RoleKey.admin,
          userId: dbuser.id,
        },
        tx,
      );

      return { id: dbuser.id, wid: dbWorkspace.id };
    });
  }

  /**
   * Login:
   * - Verifies email+password
   * - You’ll typically issue tokens at the service layer, not in the repo.
   * - Here we just validate credentials and throw if invalid.
   */
  async login(user: AuthEntity): Promise<{
    id: string;
    wid: string;
    user: {
      id: string;
      email: string;
      name: string;
      isDeleted: boolean;
    };
    workspace: any;
  }> {
    const email = user.email?.trim().toLowerCase();
    const pass = user.password;

    if (!email || !pass) {
      throw new BadRequestException('Email and password are required.');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        isDeleted: true,
        name: true,
        email: true,
      },
    });

    console.log(dbUser, 104);

    if (!dbUser || dbUser.isDeleted) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const ok = await bcrypt.compare(pass, dbUser.passwordHash!);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const dbWorkspace = await this.prisma.workspace.findFirst({
      where: { ownerUserId: dbUser.id },
    });

    console.log(dbWorkspace, 120);

    const { passwordHash, ...safeUser } = dbUser;

    return {
      id: dbUser.id,
      wid: dbWorkspace!.id,
      user: safeUser,
      workspace: dbWorkspace,
    };
  }

  /**
   * Logout:
   * - Revoke a refresh token by hashing it then marking revoked.
   * - If you don’t store refresh tokens: just no-op.
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const tokenHash = sha256(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Optional hardening: if nothing updated, it's fine—token may already be revoked/unknown.
  }

  /**
   * Change password:
   * - You should also verify the user's current password at the service layer.
   * - Here we assume the caller has already authenticated the user and passed the userId.
   * - Since your signature doesn’t include userId/currentPassword, we’ll show a stricter version below.
   *
   * Best practice signature would be:
   *   changePassword(userId: string, currentPassword: string, newPassword: string)
   *
   * But we’ll implement with what you gave: { password, confirmPassword } and
   * assume you have the userId in your AuthEntity (common in your layer).
   */
  async changePassword(params: {
    userId?: string; // <— added optional for practicality
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    const { userId, password, confirmPassword } = params;

    if (!userId) {
      // Without userId you cannot know whose password to change.
      // If you truly cannot change signature, you must pass userId via context or the service layer.
      throw new BadRequestException('userId is required to change password.');
    }
    if (!password || password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true },
    });
    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found.');
    }

    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      }),
      // Optional: revoke all existing refresh tokens so old sessions die
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /**
   * Delete user:
   * - Best practice: soft delete + revoke tokens
   * - If you truly need hard delete, also delete dependent rows in a transaction
   */
  async delete(userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('userId is required.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found.');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /**
   * Helpers you’ll likely want to call from your service layer:
   * - persist a refresh token
   * - validate a refresh token and fetch user
   *
   * If your `AuthmoduleRepo` interface can be extended, add these there.
   */

  // Example: store refresh token (hash only)
  async storeRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    workspaceId: string,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshToken),
        workspaceId: workspaceId,
        expiresAt,
      },
    });
  }

  // Example: check refresh token validity (exists, not revoked, not expired)
  async assertValidRefreshToken(
    refreshToken: string,
  ): Promise<string /* userId */> {
    const tokenHash = sha256(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { userId: true, revokedAt: true, expiresAt: true },
    });
    if (!row || row.revokedAt || row.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    return row.userId;
  }

  async get(id: string): Promise<{
    user: { id: string; email: string; name: string; isDeleted: boolean };
    workspace: any;
  }> {
    console.log(id, 286);

    const dbUser = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
        isDeleted: true,
        name: true,
        email: true,
      },
    });

    console.log(dbUser, 299);

    if (!dbUser) {
      throw new NotFoundException();
    }

    const dbWorkspace = await this.prisma.workspace.findFirst({
      where: { ownerUserId: dbUser.id },
    });

    if (!dbWorkspace) {
      throw new NotFoundException();
    }

    return { user: dbUser, workspace: dbWorkspace };
  }
}
