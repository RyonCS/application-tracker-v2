"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Load raw JSON data
    const rawUsers = JSON.parse(fs_1.default.readFileSync('users_clean.json', 'utf-8'));
    const rawJobs = JSON.parse(fs_1.default.readFileSync('jobs_clean.json', 'utf-8'));
    // Insert users first
    for (const user of rawUsers) {
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.emailAddress,
                hash: user.hash,
                salt: user.salt,
                createdAt: new Date(user.createdAt),
                role: 'APPLICANT',
                lastLoginAt: new Date(),
            },
        });
    }
    // Insert applications/jobs
    for (const job of rawJobs) {
        const userExists = rawUsers.some(u => u.id === job.userId);
        if (!userExists) {
            console.warn(`Skipping job with unknown userId: ${job.userId}`);
            continue;
        }
        // Convert string status and workMode to Prisma enums
        const status = client_1.Status[job.status.toUpperCase()];
        const workMode = job.workMode
            ? client_1.WorkMode[job.workMode.toUpperCase()]
            : null;
        await prisma.application.create({
            data: {
                id: job.id,
                applicationDate: new Date(job.date),
                company: job.company || null,
                position: job.position || null,
                location: job.location || null,
                status: status,
                workMode: workMode,
                linkToJobPosting: job.linkToPosting || null,
                userId: job.userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    console.log('Migration complete.');
}
main()
    .catch(e => {
    console.error('Migration failed:', e);
})
    .finally(async () => {
    await prisma.$disconnect();
});
