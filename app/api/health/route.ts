import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ model: Boolean(process.env.NEBIUS_API_KEY?.trim()) });
}
