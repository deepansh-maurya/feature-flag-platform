"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAdminPasskeyAndSave = GenerateAdminPasskeyAndSave;
const prisma_authmodule_repo_1 = require("../src/authmodule/infrastructure/prisma/prisma-authmodule.repo");
const prisma_service_1 = require("../src/infra/prisma/prisma.service");
const bcrypt = require("bcrypt");
async function GenerateAdminPasskeyAndSave() {
    try {
        const prisma = new prisma_service_1.default();
        await prisma.$connect();
        const admin = await prisma.admin.findFirst();
        if (admin)
            throw new Error("admin exist");
        const passKey = process.env.PASS_KEY;
        const hash = await bcrypt.hash(passKey, prisma_authmodule_repo_1.BCRYPT_ROUNDS);
        prisma.admin.create({
            data: {
                passKey: hash
            }
        });
        await prisma.$disconnect();
    }
    catch (error) {
        console.log("failed to store passkey");
    }
}
GenerateAdminPasskeyAndSave();
//# sourceMappingURL=admin-passkeys.js.map