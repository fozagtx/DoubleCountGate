import { NextResponse } from "next/server";
import { assess } from "@/lib/gate";
import { ModelConfigError, readModel } from "@/lib/model";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a JSON body with the paperwork in text." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Paste an evidence pack before asking for a read." }, { status: 400 });
  }
  if (text.length > 20_000) {
    return NextResponse.json(
      { error: "That note is longer than this prototype accepts (20,000 characters)." },
      { status: 400 },
    );
  }

  try {
    const model = await readModel(text);
    const decision = assess(text, model);
    return NextResponse.json({ decision, fieldNotes: model.fieldNotes });
  } catch (error) {
    if (error instanceof ModelConfigError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "The model request failed.";
    return NextResponse.json({ error: message, code: "MODEL_FAILED" }, { status: 502 });
  }
}
