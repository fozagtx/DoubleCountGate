import fs from "node:fs";
import path from "node:path";
import { expect } from "chai";

const root = process.cwd();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx|js|jsx|sol)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe("C2 — the model cannot mint", () => {
  const forbidden = [/ISSUER_PRIVATE_KEY/, /new ethers\.Wallet/, /writeContract/, /\.mint\(/];

  for (const relative of ["app/api", "lib/model.ts", "lib/gate.ts", "lib/evidence.ts"]) {
    it(`${relative} has no signer and no mint call`, () => {
      const target = path.join(root, relative);
      const files = fs.statSync(target).isDirectory() ? walk(target) : [target];
      expect(files.length).to.be.greaterThan(0);
      for (const file of files) {
        const source = fs.readFileSync(file, "utf8");
        for (const pattern of forbidden) {
          expect(source, `${path.relative(root, file)} matches ${pattern}`).to.not.match(pattern);
        }
      }
    });
  }

  it("the issuer module is only imported by the CLI mint script", () => {
    const importers: string[] = [];
    for (const file of [...walk(path.join(root, "app")), ...walk(path.join(root, "components")), ...walk(path.join(root, "lib")), ...walk(path.join(root, "scripts"))]) {
      const source = fs.readFileSync(file, "utf8");
      if (source.includes('from "../lib/issuer"') || source.includes('from "@/lib/issuer"') || source.includes('from "./issuer"')) {
        importers.push(path.relative(root, file));
      }
    }
    expect(importers).to.deep.equal(["scripts/extract-and-mint.ts"]);
  });

  it("api routes do not hold the local issuer key", () => {
    const files = walk(path.join(root, "app", "api"));
    expect(files.length).to.be.greaterThan(0);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, path.relative(root, file)).to.not.match(/local-issuer|LOCAL_ISSUER_PRIVATE_KEY|ac0974bec39a17e36/);
    }
  });

  it("the frontend ABI names the lock the contract uses", () => {
    const artifact = JSON.parse(
      fs.readFileSync(
        path.join(root, "artifacts/contracts/CreditRegistry.sol/CreditRegistry.json"),
        "utf8",
      ),
    ) as { abi: Array<{ type: string; name?: string }> };
    const abiSource = fs.readFileSync(path.join(root, "lib/abi.ts"), "utf8");
    for (const name of [
      "mint",
      "retire",
      "contest",
      "getCredit",
      "creditIdForEvidence",
      "EVIDENCE_ALREADY_USED",
      "CreditMinted",
      "CreditRetired",
      "CreditContested",
    ]) {
      expect(artifact.abi.some((item) => item.name === name), `artifact missing ${name}`).to.equal(true);
      expect(abiSource.includes(`"${name}"`), `frontend ABI missing ${name}`).to.equal(true);
    }
  });
});
