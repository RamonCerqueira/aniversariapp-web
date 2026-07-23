
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch family names for logs that have familyId
    const familyIds = logs.map(l => l.familyId).filter(Boolean) as string[];
    const families = await prisma.family.findMany({
      where: { id: { in: familyIds } },
      select: { id: true, name: true }
    });

    const familyMap = Object.fromEntries(families.map(f => [f.id, f.name]));

    const logsWithFamily = logs.map(l => ({
      ...l,
      familyName: l.familyId ? familyMap[l.familyId] : "Sistema"
    }));

    return NextResponse.json(logsWithFamily);
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
  }
}
