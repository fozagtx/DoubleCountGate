import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const file = path.join(process.cwd(), "deployments", "localhost.json");
  if (!fs.existsSync(file)) {
    return NextResponse.json(
      {
        error: "No local registry is deployed. Start `npx hardhat node`, then `npm run deploy`.",
        code: "NOT_DEPLOYED",
      },
      { status: 404 },
    );
  }

  const deployment = JSON.parse(fs.readFileSync(file, "utf8")) as {
    address?: string;
    chainId?: number;
  };
  if (!deployment.address) {
    return NextResponse.json(
      { error: "deployments/localhost.json has no contract address.", code: "NOT_DEPLOYED" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    address: deployment.address,
    chainId: deployment.chainId ?? 31337,
  });
}
