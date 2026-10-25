import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { assess, type ModelExtraction } from "@/lib/gate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const root = process.cwd();
  const which = new URL(request.url).searchParams.get("which");
  const sourceFile = which === "thin" ? "mrv-thin-synthetic.txt" : "mrv-cedarbend-synthetic.txt";
  const fieldsFile = which === "thin" ? "thin-fields.json" : "cedarbend-fields.json";
  const source = fs.readFileSync(path.join(root, "samples", sourceFile), "utf8");
  const fields = JSON.parse(fs.readFileSync(path.join(root, "samples", fieldsFile), "utf8")) as ModelExtraction;
  const decision = assess(source, fields);

  return NextResponse.json({
    synthetic: true,
    modelCalled: false,
    label: which === "thin"
      ? "Synthetic incomplete example. No model was called."
      : "Synthetic fingerprint for Cedar Bend Afforestation Pilot. Computed from the sample file in this repo. No model was called.",
    decision,
  });
}
