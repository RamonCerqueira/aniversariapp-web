import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dbGuests = await prisma.guest.findMany({
    where: { partyId: "6e021c38-96c8-4743-b4c9-65bad7772fb0" }
  });

  const guests = dbGuests.map(g => ({
    id: g.id,
    name: g.name,
    accompany: g.companions,
    status: g.status,
  }));

  console.log("Accompany values:", guests.map(g => g.accompany));

  const totalGuests = guests.reduce((acc, g) => acc + 1 + (g.accompany || 0), 0);
  const confirmedCount = guests.filter(g => g.status === 'confirmed').reduce((acc, g) => acc + 1 + (g.accompany || 0), 0);

  console.log("totalGuests:", totalGuests);
  console.log("confirmedCount:", confirmedCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
