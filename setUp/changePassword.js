"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./../src/lib/prisma"));
async function hashPassword() {
    const saltRounds = 10;
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    const hashedPassword = await bcrypt_1.default.hash('Testing123!', salt);
    return hashedPassword;
}
async function addPassword() {
    const newPassword = await hashPassword();
    console.log(newPassword);
    await prisma_1.default.user.update({
        where: { email: 'Render@yahoo.com' },
        data: { passwordHash: newPassword },
    });
}
async function main() {
    await addPassword();
}
main();
