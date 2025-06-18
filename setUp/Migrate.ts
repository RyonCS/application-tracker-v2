import { PrismaClient, Status, WorkMode } from '@prisma/client';
import fs from 'fs';

interface RawUser {
  id: string;
  emailAddress: string;
  hash: string;
  salt: string;
  createdAt: string;
  // add other properties if needed
}

interface RawJob {
  id: string;
  date: string;
  company?: string;
  position?: string;
  location?: string;
  status: string;
  workMode?: string | null;
  linkToPosting?: string;
  userId: string;
}

const prisma = new PrismaClient();

async function main() {
  // Load raw JSON data
  const rawUsers: RawUser[] = JSON.parse(fs.readFileSync('users_clean.json', 'utf-8'));
  const rawJobs: RawJob[] = JSON.parse(fs.readFileSync('jobs_clean.json', 'utf-8'));

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
    const status: Status = Status[job.status.toUpperCase() as keyof typeof Status];
    const workMode: WorkMode | null = job.workMode
      ? WorkMode[job.workMode.toUpperCase() as keyof typeof WorkMode]
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
