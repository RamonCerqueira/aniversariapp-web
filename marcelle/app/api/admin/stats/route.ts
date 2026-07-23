
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.guest.count({
      where: { confirmed: true }
    });

    const present = await prisma.guest.count({
      where: { checkedIn: true }
    });

    return NextResponse.json({ total, present });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
