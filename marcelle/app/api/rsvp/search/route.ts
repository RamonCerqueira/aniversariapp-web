
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.length < 3) {
    return NextResponse.json({ families: [] });
  }

  const celebrateApiUrl = process.env.CELEBRATE_API_URL || "https://celebrate.genioplay.com.br/api";
  const partyId = process.env.CELEBRATE_PARTY_ID || "6e021c38-96c8-4743-b4c9-65bad7772fb0";

  try {
    const res = await fetch(`${celebrateApiUrl}/guests/public/search-external?partyId=${partyId}&q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch from Celebrate: ${res.status}`);
    }
    const guests = await res.json();
    
    // Map Celebrate guests to match the structure expected by Marcelle's search component
    const families = guests.map((g: any) => ({
      id: g.id,
      name: g.name,
      code: g.id,
      maxGuests: (g.companions || 0) + 1,
      type: (g.companions || 0) > 0 ? "FAMILY" : "FRIEND",
      isConfirmed: g.status === "confirmed"
    }));

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Search error in Celebrate integration:", error);
    return NextResponse.json({ error: "Erro ao buscar convite" }, { status: 500 });
  }
}
