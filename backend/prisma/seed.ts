/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
const path = require('node:path');

const achievementsPath = path.join(process.cwd(), 'achievements.json');

const achievements: AchievementEntry[] = require(achievementsPath);

type AchievementEntry = {
  name: string;
  description: string;
  slug: string;
  difficulty: number;
}

// initialize Prisma Client
const prisma = new PrismaClient();

async function populateAchievements() {
  return Promise.all(achievements.map(async data => {
    try {
      await prisma.achievement.create({ data });
    } catch {
      ;
    }
  }));
}

async function main() {
  await prisma.$connect();

  await populateAchievements();
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
  
