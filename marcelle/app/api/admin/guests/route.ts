import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        family: {
          select: {
            musicSuggestion: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        name: "asc",
      },
    });

    // Formatamos os dados para que o frontend receba exatamente o que espera
    const formattedGuests = guests.map(g => ({
      id: g.id,
      name: g.name,
      email: g.family?.email || "",
      ticketCode: g.ticketCode,
      hasCheckedIn: g.checkedIn,
      musicSuggestion: g.family?.musicSuggestion || null,
      familyGroupName: g.family?.name
    }));

    return NextResponse.json(formattedGuests);
  } catch (error) {
    console.error("Erro ao buscar lista de convidados:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
