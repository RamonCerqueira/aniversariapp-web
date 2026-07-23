import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const family = await prisma.family.findUnique({
      where: { code: code.toUpperCase() },
      include: { guests: true },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Código de convite inválido" },
        { status: 404 }
      );
    }

    return NextResponse.json(family);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar convite" },
      { status: 500 }
    );
  }
}
