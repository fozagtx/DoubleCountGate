import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const samples = {
  full: {
    file: "mrv-cedarbend-synthetic.txt",
    label: "Synthetic MRV: Cedar Bend Afforestation Pilot. Invented for this prototype. Not a real project.",
  },
  thin: {
    file: "mrv-thin-synthetic.txt",
    label: "Synthetic MRV: incomplete on purpose. Invented. There is nothing here to issue.",
  },
} as const;

export async function GET(request: Request) {
  const which = new URL(request.url).searchParams.get("which") === "thin" ? "thin" : "full";
  const sample = samples[which];
  const text = fs.readFileSync(path.join(process.cwd(), "samples", sample.file), "utf8");
  return NextResponse.json({ which, synthetic: true, label: sample.label, text });
}
