import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, birthDate: true, role: true }
  });
  console.log("Usuarios cadastrados:");
  users.forEach(u => console.log(`${u.email} | ${u.birthDate} | ${u.role}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
