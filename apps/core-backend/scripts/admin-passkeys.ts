import { BCRYPT_ROUNDS } from "src/authmodule/infrastructure/prisma/prisma-authmodule.repo";
import PrismaService from "src/infra/prisma/prisma.service";
import * as bcrypt from "bcrypt";
export async function GenerateAdminPasskeyAndSave() {
    try {
        const prisma = new PrismaService()
        await prisma.$connect()
        const passKey = process.env.PASS_KEY!
        const hash = await bcrypt.hash(passKey, BCRYPT_ROUNDS);
        prisma.admin.create({
            data: {
                passKey: hash
            }
        })

        await prisma.$disconnect()

    } catch (error) {
        console.log("failed to store passkey");
    }
}

GenerateAdminPasskeyAndSave()