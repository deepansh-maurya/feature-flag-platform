import { BCRYPT_ROUNDS } from '../src/authmodule/infrastructure/prisma/prisma-authmodule.repo';
import { prismaService } from '../src/infra/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
export async function GenerateAdminPasskeyAndSave() {
  try {
    await prismaService.$connect();
    const admin = await prismaService.admin.findFirst();
    if (admin) throw new Error('admin exist');
    const passKey = process.env.PASS_KEY!;
    const hash = await bcrypt.hash(passKey, BCRYPT_ROUNDS);
    prismaService.admin.create({
      data: {
        passKey: hash,
      },
    });
    await prismaService.$disconnect();
  } catch (error) {
    console.log('failed to store passkey');
  }
}
GenerateAdminPasskeyAndSave();
