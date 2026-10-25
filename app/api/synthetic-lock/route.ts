import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { assess, type ModelExtraction } from "@/lib/gate";

export const dynamic = "force-dynamic";

export async function GET() {
  const root = process.cwd();
  const source = fs.readFileSync(path.join(root, "samples", "mrv-cedarbend-synthetic.txt"), "utf8");
  const fields = JSON.parse(
    fs.readFileSync(path.join(root, "samples", "cedarbend-fields.json"), "utf8"),
  ) as ModelExtraction;
  const decision = assess(source, fields);
  if (!decision.ok) {
    return NextResponse.json(
      {
        error: "The synthetic pack failed its own gate. No fingerprint was offered.",
        reasons: decision.reasons,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    synthetic: true,
    modelCalled: false,
    label:
      "Synthetic fingerprint for Cedar Bend Afforestation Pilot. Computed from the sample file in this repo. No model was called.",
    decision,
  });
}
