export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL?.trim() || "http://127.0.0.1:8545";

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

export const walletConnectConfigured = walletConnectProjectId.length > 0;
