export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

export const walletConnectConfigured = walletConnectProjectId.length > 0;
