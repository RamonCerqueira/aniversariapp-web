const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const families = await prisma.family.findMany({
    include: { guests: true }
  });
  console.log("=== MARCELLE FAMILIES & GUESTS ===");
  families.forEach(f => {
    console.log(`Family: ${f.name} | Code: ${f.code} | MaxGuests: ${f.maxGuests}`);
    f.guests.forEach(g => {
      console.log(`  - Guest: ${g.name} | Confirmed: ${g.confirmed} | ticketCode: ${g.ticketCode}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
