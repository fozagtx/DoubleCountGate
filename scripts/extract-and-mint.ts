import fs from "node:fs";
import path from "node:path";
import { assess } from "../lib/gate";
import { mintAsIssuer } from "../lib/issuer";
import { modelConfigFromEnv, readModel } from "../lib/model";

async function main() {
  const sample = process.argv[2] || "samples/mrv-cedarbend-synthetic.txt";
  const file = path.resolve(process.cwd(), sample);
  if (!fs.existsSync(file)) {
    console.error(`No sample at ${file}`);
    process.exit(1);
  }

  const source = fs.readFileSync(file, "utf8");
  const config = modelConfigFromEnv();
  console.log(`Reading ${path.relative(process.cwd(), file)}`);
  console.log(`Model ${config.model} at ${config.baseURL}`);
  console.log("The model is not given a mint key.");

  const extraction = await readModel(source);
  const decision = assess(source, extraction);
  console.log(`confidence ${decision.confidence ?? "missing"} (line ${decision.threshold.toFixed(2)})`);

  if (!decision.ok || !decision.hash || !decision.canonical) {
    console.log("REFUSE");
    for (const reason of decision.reasons) console.log(` - ${reason}`);
    process.exit(0);
  }

  console.log(`fingerprint ${decision.hash}`);
  const minted = await mintAsIssuer(decision.hash, decision.canonical);
  console.log(`minted by ${minted.signer}`);
  console.log(`registry ${minted.registry}`);
  console.log(`tx ${minted.txHash}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
