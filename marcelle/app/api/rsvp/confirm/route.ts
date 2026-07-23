
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/resend";

const guestSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ageGroup: z.enum(["ADULT", "CHILD", "TEEN"]).optional(),
});

const confirmSchema = z.object({
  code: z.string().min(1),
  guests: z.array(guestSchema),
  message: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  musicSuggestion: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = confirmSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { code, guests, message, musicSuggestion } = result.data;

    // Buscar família pelo código
    const family = await prisma.family.findUnique({
      where: { code },
      include: { guests: true },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Código de convite inválido" },
        { status: 404 }
      );
    }

    if (family.isConfirmed) {
      return NextResponse.json(
        { error: "A presença desta família já foi confirmada e não pode ser alterada." },
        { status: 400 }
      );
    }

    if (guests.length > family.maxGuests) {
      return NextResponse.json(
        { error: `O limite de convidados para sua família é de ${family.maxGuests} pessoas.` },
        { status: 400 }
      );
    }

    // Transação para garantir integridade
    const updatedGuests = await prisma.$transaction(async (tx) => {
      // 1. Remover convidados anteriores (se houver, limpa para garantir estado novo)
      await tx.guest.deleteMany({
        where: { familyId: family.id },
      });

      // 2. Criar novos convidados com ticketCode único
      const createdGuests = [];
      for (const g of guests) {
        const ticketCode = `M15-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newGuest = await tx.guest.create({
          data: {
            name: g.name,
            ageGroup: g.ageGroup,
            confirmed: true,
            ticketCode: ticketCode,
            familyId: family.id,
          },
        });
        createdGuests.push(newGuest);
      }

      // 3. Marcar família como confirmada e salvar mensagem
      await tx.family.update({
        where: { id: family.id },
        data: { 
          isConfirmed: true,
          message: message || null,
          musicSuggestion: musicSuggestion || null
        },
      });

      // 4. Gerar Audit Log
      await tx.auditLog.create({
        data: {
          action: "RSVP_CONFIRMATION",
          familyId: family.id,
          details: JSON.stringify({
            previousGuestsCount: family.guests.length,
            newGuestsCount: guests.length,
            guestNames: guests.map((g) => g.name).join(", "),
            hasMessage: !!message,
            hasMusic: !!musicSuggestion,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return createdGuests;
    });

    // Enviar E-mail com Tickets (QR Codes)
    if (email) {
      const ticketListHtml = updatedGuests.map(g => `
        <div style="border: 2px solid #D4AF37; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center; background-color: #FDFDFD;">
          <h3 style="color: #9B111E; font-family: serif; margin-bottom: 5px;">${g.name}</h3>
          <p style="color: #666; font-size: 12px; margin-top: 0;">Código: ${g.ticketCode}</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${g.ticketCode}" alt="QR Code" style="width: 150px; height: 150px;" />
          <p style="color: #002366; font-size: 14px; font-weight: bold; margin-top: 10px;">APRESENTE NA PORTARIA</p>
        </div>
      `).join("");

      await sendEmail({
        to: email,
        subject: `Seus Convites Reais - Marcelle 15 Anos`,
        html: `
          <div style="background-color: #001233; padding: 40px; font-family: sans-serif; color: #F5F5F0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FAF9F6; padding: 30px; border-radius: 20px; color: #001233; text-align: center; border: 4px double #D4AF37;">
              <h1 style="font-family: serif; color: #D4AF37;">Marcelle 15 Anos</h1>
              <p style="font-style: italic; font-size: 18px;">Um Conto de Fadas Real</p>
              <hr style="border: 0; border-top: 1px solid #D4AF37; margin: 20px 0;" />
              <p>Olá <strong>${family.name}</strong>,</p>
              <p>Sua presença real foi confirmada! Abaixo estão os seus ingressos digitais para o Grande Baile.</p>
              
              <div style="margin-top: 30px;">
                ${ticketListHtml}
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #F0E6D2; border-radius: 10px;">
                <p style="font-size: 14px; margin: 0;"><strong>Data:</strong> 22 de Agosto de 2026 às 19:00</p>
                <p style="font-size: 14px; margin: 5px 0;"><strong>Local:</strong> Mansão das Estrelas</p>
              </div>

              <p style="margin-top: 30px; font-size: 12px; color: #666;">Por favor, não compartilhe este e-mail. Cada QR Code é único e válido para uma única entrada.</p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao confirmar presença:", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar presença" },
      { status: 500 }
    );
  }
}
