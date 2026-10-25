import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const model = Boolean(process.env.OPENAI_API_KEY?.trim() || process.env.OPENAI_BASE_URL?.trim());
  let registry: string | null = null;
  const file = path.join(process.cwd(), "deployments", "localhost.json");
  if (fs.existsSync(file)) {
    try {
      const deployment = JSON.parse(fs.readFileSync(file, "utf8")) as { address?: string };
      registry = deployment.address ?? null;
    } catch {
      registry = null;
    }
  }

  return NextResponse.json({ model, registry });
}
