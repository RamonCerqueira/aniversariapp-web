import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const guests = await prisma.guest.findMany({
    where: { partyId: "6e021c38-96c8-4743-b4c9-65bad7772fb0" }
  });
  console.log("Guests for Marcelle party:", guests.map(g => ({ id: g.id, name: g.name, status: g.status, companions: g.companions, companionNames: g.companionNames })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
