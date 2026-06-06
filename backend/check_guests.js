import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const guests = await prisma.guest.findMany();
  console.log("DATABASE_GUESTS_JSON_START");
  console.log(JSON.stringify(guests));
  console.log("DATABASE_GUESTS_JSON_END");
}

main().catch(console.error).finally(() => prisma.$disconnect());
