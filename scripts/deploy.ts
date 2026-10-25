import fs from "node:fs";
import path from "node:path";
import { ethers, network } from "hardhat";

async function main() {
  const registry = await ethers.deployContract("CreditRegistry");
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  const chain = await ethers.provider.getNetwork();

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${network.name}.json`);
  const payload = {
    address,
    chainId: Number(chain.chainId),
    network: network.name,
    contract: "CreditRegistry",
  };
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`CreditRegistry ${address}`);
  console.log(`chain ${payload.chainId} (${network.name})`);
  console.log(`wrote ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
