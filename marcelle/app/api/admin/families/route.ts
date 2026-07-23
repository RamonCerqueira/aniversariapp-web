
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const familySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  maxGuests: z.number().min(1),
  type: z.enum(["FAMILY", "FRIEND"]).default("FAMILY"),
});

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const families = await prisma.family.findMany({
    include: { guests: true },
    orderBy: [
      { type: "asc" }, // Families first, then friends (or vice-versa, depending on enum order)
      { name: "asc" }
    ],
  });

  return NextResponse.json(families);
}

export async function POST(request: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Validate
    const parsed = familySchema.safeParse({
      ...body,
      maxGuests: Number(body.maxGuests),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, code, maxGuests, type } = parsed.data;

    const family = await prisma.family.create({
      data: {
        name,
        code: code.toUpperCase(), // Normalize code
        maxGuests,
        type,
      },
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
      { error: "Erro ao criar família" },
      { status: 500 }
    );
  }
}
