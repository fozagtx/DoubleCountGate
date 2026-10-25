export function assertLoopbackRpc(rpcUrl: string): void {
  let url: URL;
  try {
    url = new URL(rpcUrl);
  } catch {
    throw new Error("The local issuer only talks to a loopback Hardhat node. The RPC URL is not valid.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host !== "127.0.0.1" && host !== "localhost" && host !== "::1") {
    throw new Error(
      `The local issuer refuses RPC host ${host}. It only signs against a Hardhat node on this machine.`,
    );
  }
}
