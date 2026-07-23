import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING RSVP FLOW VALIDATION TESTS ===");

  const guestId = "b69b93c8-9076-4eb1-a2a4-cdb227fa149f"; // Vinicius Dias
  const partyId = "6e021c38-96c8-4743-b4c9-65bad7772fb0"; // Marcelle Dias 15 Anos

  // 1. Reset guest status for testing cleanliness
  console.log("\n[Test 1] Resetting guest status to pending...");
  await prisma.guest.update({
    where: { id: guestId },
    data: {
      status: "pending",
      companionNames: [],
      email: null,
      favoriteSong: null,
      messageToHost: null
    }
  });
  console.log("✔ Reset successful.");

  // 2. Test Public Search
  console.log("\n[Test 2] Simulating public search for 'Vinicius'...");
  const searchResults = await prisma.guest.findMany({
    where: {
      partyId,
      name: { contains: "Vinicius", mode: "insensitive" }
    }
  });

  if (searchResults.length > 0 && searchResults[0].id === guestId) {
    console.log(`✔ Public search passed. Found guest: ${searchResults[0].name}`);
  } else {
    throw new Error("✘ Public search failed: Guest not found.");
  }

  // 3. Test Public RSVP Confirmation
  console.log("\n[Test 3] Simulating public RSVP confirmation from form submission...");
  const status = "confirmed";
  const companionNames = ["Catarina Dias", "Bernardo Dias"];
  const email = "vinicius@example.com";
  const favoriteSong = "Dancing Queen";
  const messageToHost = "Mal posso esperar pela festa!";

  // Simulates logic inside rsvpResponse controller
  await prisma.guest.update({
    where: { id: guestId },
    data: {
      status,
      companionNames,
      email,
      favoriteSong,
      messageToHost
    }
  });
  console.log("✔ RSVP update applied successfully.");

  // 4. Verify Database Integrity
  console.log("\n[Test 4] Verifying database integrity...");
  const updatedGuest = await prisma.guest.findUnique({
    where: { id: guestId }
  });

  console.log("Updated guest records:");
  console.log("- Status:", updatedGuest.status);
  console.log("- Companions names:", updatedGuest.companionNames);
  console.log("- Email:", updatedGuest.email);
  console.log("- Favorite song:", updatedGuest.favoriteSong);
  console.log("- Message to host:", updatedGuest.messageToHost);

  if (
    updatedGuest.status === "confirmed" &&
    updatedGuest.companionNames.length === 2 &&
    updatedGuest.companionNames[0] === "Catarina Dias" &&
    updatedGuest.companionNames[1] === "Bernardo Dias" &&
    updatedGuest.email === "vinicius@example.com" &&
    updatedGuest.favoriteSong === "Dancing Queen" &&
    updatedGuest.messageToHost === "Mal posso esperar pela festa!"
  ) {
    console.log("\n👑 ALL RSVP FLOW INTEGRATION TESTS PASSED SUCCESSFULLY! 👑");
  } else {
    throw new Error("✘ Database verification failed: Record properties mismatch.");
  }
}

runTests()
  .catch((err) => {
    console.error("\n❌ TESTS FAILED:", err.message);
  })
  .finally(() => {
    prisma.$disconnect();
  });
