import fs from "node:fs";
import path from "node:path";
import { ethers } from "hardhat";
import { assess, type ModelExtraction } from "../lib/gate";
import { modelConfigFromEnv, readModel, ModelConfigError } from "../lib/model";

const root = process.cwd();

function read(relative: string): string {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function line(label: string, value: string) {
  console.log(`${label.padEnd(18)} ${value}`);
}

async function main() {
  console.log("Faircri");
  console.log("Stop the same evidence pack from minting two credits.\n");

  const source = read("samples/mrv-cedarbend-synthetic.txt");
  const fields = JSON.parse(read("samples/cedarbend-fields.json")) as ModelExtraction;
  const decision = assess(source, fields);
  if (!decision.ok || !decision.hash || !decision.canonical) {
    console.error("The synthetic Cedar Bend pack failed its own gate. Nothing was minted.");
    for (const reason of decision.reasons) console.error(` - ${reason}`);
    process.exit(1);
  }

  const registry = await ethers.deployContract("CreditRegistry");
  await registry.waitForDeployment();
  const [signer] = await ethers.getSigners();

  console.log("1. First mint");
  line("evidence", decision.hash);
  line("canonical", decision.canonical);
  line("signer", `${signer.address} (hardhat deployer, not the model)`);
  const minted = await registry.mint(decision.hash, decision.canonical);
  await minted.wait();
  const creditId = await registry.creditIdForEvidence(decision.hash);
  const credit = await registry.getCredit(creditId);
  line("credit", `#${creditId.toString()}`);
  line("status", statusName(Number(credit.status)));
  console.log("");

  console.log("2. Second mint, same fingerprint");
  let blocked = 0;
  const attempts = 2;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await registry.mint(decision.hash, decision.canonical);
      console.error(`attempt ${attempt}: mint succeeded. The registry did not block it.`);
      process.exit(1);
    } catch (error) {
      const decoded = registry.interface.parseError(revertData(error));
      if (!decoded || decoded.name !== "EVIDENCE_ALREADY_USED") {
        console.error(error);
        process.exit(1);
      }
      blocked += 1;
      const existing = decoded.args[1] as bigint;
      console.log(`attempt ${attempt}: REVERT EVIDENCE_ALREADY_USED (credit #${existing.toString()})`);
    }
  }
  console.log("");

  console.log("3. Weak paperwork — application refuse, before any mint");
  const thin = read("samples/mrv-thin-synthetic.txt");
  const hallucinated: ModelExtraction = {
    projectName: "River Trees",
    methodology: "VM0012-demo",
    reportingPeriod: "2024-01-01 to 2024-12-31",
    geography: "Demo temperate zone (synthetic location)",
    tonnesCo2e: 5000,
    evidenceId: "SYN-MADE-UP",
    confidence: 0.99,
    fieldNotes: "Demo fixture: a confident invention. Not a model response.",
  };
  const ungrounded = assess(thin, hallucinated);
  if (ungrounded.ok) {
    console.error("The gate accepted paperwork that does not contain those fields.");
    process.exit(1);
  }
  console.log("case A: invented fields on the thin synthetic note");
  console.log("APP REFUSE");
  for (const reason of ungrounded.reasons) console.log(` - ${reason}`);

  const lowConfidence: ModelExtraction = { ...fields, confidence: 0.22, fieldNotes: "Demo fixture." };
  const low = assess(source, lowConfidence);
  if (low.ok) {
    console.error("The gate accepted a low-confidence read.");
    process.exit(1);
  }
  console.log("case B: same Cedar Bend fields, confidence 0.22");
  console.log("APP REFUSE");
  for (const reason of low.reasons) console.log(` - ${reason}`);

  const issued = await registry.nextId();
  if (issued !== 1n) {
    console.error(`Expected exactly one credit on the registry, found ${issued.toString()}.`);
    process.exit(1);
  }
  console.log("chain txs from the refuse cases: 0");
  console.log("");

  console.log("4. Live model");
  let liveNote = "not called";
  try {
    const config = modelConfigFromEnv();
    console.log(`calling ${config.model} at ${config.baseURL}`);
    const live = assess(thin, await readModel(thin));
    if (live.ok) {
      console.log("LIVE PASS — the model returned a grounded read above the line.");
      console.log("The demo does not mint that read. A wallet (or ISSUER_PRIVATE_KEY) would have to sign.");
      liveNote = "pass, not minted here";
    } else {
      console.log("APP REFUSE");
      for (const reason of live.reasons) console.log(` - ${reason}`);
      liveNote = "refuse";
    }
  } catch (error) {
    if (error instanceof ModelConfigError) {
      console.log("FAIL LOUD: model is not configured.");
      console.log(error.message);
      console.log("No mock extraction was substituted.");
      liveNote = "not configured";
    } else {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  console.log("");
  console.log(`Judge: ${blocked}/${attempts} double-mints blocked. Weak reads refused before mint. Live model: ${liveNote}.`);
}

function statusName(status: number): string {
  return ["None", "Issued", "Retired", "Contested"][status] ?? String(status);
}

function revertData(error: unknown): string {
  const visited = new Set<unknown>();
  const stack: unknown[] = [error];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || visited.has(current)) continue;
    visited.add(current);
    const record = current as { data?: unknown; cause?: unknown; error?: unknown };
    if (typeof record.data === "string" && record.data.startsWith("0x") && record.data.length > 10) {
      return record.data;
    }
    if (record.cause) stack.push(record.cause);
    if (record.error) stack.push(record.error);
  }
  throw new Error("Mint did not revert with a contract error.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
