
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  maxGuests: z.number().min(1).optional(),
  type: z.enum(["FAMILY", "FRIEND"]).optional(),
  isConfirmed: z.boolean().optional(),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.family.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir família" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  try {
    const body = await request.json();
    
    const parsed = updateSchema.safeParse({
        ...body,
        maxGuests: body.maxGuests ? Number(body.maxGuests) : undefined
    });

    if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.format() },
          { status: 400 }
        );
    }

    const data = parsed.data;
    if (data.code) data.code = data.code.toUpperCase();

    const family = await prisma.family.update({
      where: { id },
      data,
    });
    return NextResponse.json(family);
  } catch (error: any) {
    if (error.code === 'P2002') {
        return NextResponse.json(
         { error: "Já existe uma família com este código." },
         { status: 400 }
       );
     }
    return NextResponse.json(
      { error: "Erro ao atualizar família" },
      { status: 400 }
    );
  }
}
