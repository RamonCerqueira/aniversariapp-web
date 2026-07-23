
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkinSchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = checkinSchema.parse(body);

    // 1. Buscar o convidado pelo ticketCode
    const guest = await prisma.guest.findUnique({
      where: { ticketCode: code },
      include: {
        family: {
          select: { name: true }
        }
      }
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Convite não encontrado ou código inválido." },
        { status: 404 }
      );
    }

    // 2. Verificar se já fez check-in
    if (guest.checkedIn) {
      return NextResponse.json(
        { 
          error: "Este convite JÁ FOI UTILIZADO.", 
          guest: { name: guest.name, family: guest.family } 
        },
        { status: 400 }
      );
    }

    // 3. Marcar check-in
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { checkedIn: true },
      include: {
        family: {
          select: { name: true }
        }
      }
    });

    // 4. Auditoria
    await prisma.auditLog.create({
      data: {
        action: "CHECKIN_VALIDATION",
        familyId: guest.familyId,
        details: JSON.stringify({
          guestName: guest.name,
          ticketCode: code,
          timestamp: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.error("Erro no check-in:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
