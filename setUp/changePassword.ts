import bcrypt from 'bcrypt';
import prisma from './../src/lib/prisma';

async function hashPassword() {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash('Testing123!', salt);
    return hashedPassword
}


async function addPassword() {
    const newPassword = await hashPassword();
    console.log(newPassword)
    await prisma.user.update({
        where: { email: 'Render@yahoo.com' },
        data: { passwordHash: newPassword },
    })
}

async function main() {
    await addPassword();
}

main();

