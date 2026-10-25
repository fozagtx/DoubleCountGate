import fs from "node:fs";
import { ethers } from "ethers";

const mintAbi = ["function mint(bytes32 evidenceHash, string uri) returns (uint256)"];

/// CLI-only signer. The model module never imports this file.
export async function mintAsIssuer(evidenceHash: string, uri: string) {
  const privateKey = process.env.ISSUER_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error(
      "ISSUER_PRIVATE_KEY is not set. The language model does not hold a mint key. Set an issuer key, or mint from the connected wallet in the web app.",
    );
  }

  const deploymentPath = "deployments/localhost.json";
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(
      `No deployment file at ${deploymentPath}. Start \`npx hardhat node\` and run \`npm run deploy\` before the CLI mint.`,
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as { address?: string };
  if (!deployment.address) {
    throw new Error(`${deploymentPath} has no address.`);
  }

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL?.trim() || "http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(privateKey, provider);
  const registry = new ethers.Contract(deployment.address, mintAbi, wallet);
  const tx = await registry.mint(evidenceHash, uri);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash as string,
    blockNumber: receipt?.blockNumber as number | undefined,
    signer: wallet.address,
    registry: deployment.address,
  };
}
