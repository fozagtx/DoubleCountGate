# Faircri

Faircri helps people check environmental reports and issue a public registry record for a report that meets the stated checks. It is an early prototype: credits are test-network records, not financial products or proof that a project is true.

## The app

- `/` explains the service and links to the app.
- Connect a real wallet to open `/dashboard`.
- Use Overview to see the connected wallet's USDC (test) balance and issued credits.
- Use Check a report to read one of the clearly marked examples or paste a report for AI reading.
- Use My credits to review, retire, or flag credits issued by that wallet.
- Use Check a fingerprint to look up a report fingerprint in the registry.

The app uses **Arc Testnet** (chain ID `5042002`), Circle's public test network. Network fees are paid in native USDC (18 decimals); there is no mining. Test USDC has no real-world value. Connect your own wallet; the app does not provide a test wallet. Get test USDC from the [Circle faucet](https://faucet.circle.com) and choose Arc Testnet.

The app reads the committed registry address and deployment block from `deployments/arcTestnet.json`.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The app defaults to the Arc Testnet RPC in `lib/chain.ts`; set `NEXT_PUBLIC_RPC_URL` in `.env` only if you need an override. WalletConnect QR support additionally needs `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`; injected browser wallets can connect without it.

## AI report reading

Pasted reports are read with Nebius. Set `NEBIUS_API_KEY` in `.env` to enable this path. The optional `NEBIUS_BASE_URL` and `NEBIUS_MODEL` defaults are:

```dotenv
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEBIUS_MODEL=meta-llama/Llama-3.3-70B-Instruct
```

Without the API key, the app says **“AI reading isn't set up on this site yet”**; the clearly labeled synthetic examples remain available. Example reports and their extracted fields are sample data, not claims about real projects.

## Deploy the Arc Testnet registry

Set `DEPLOYER_PRIVATE_KEY` in your local `.env` to a deployer account funded with test USDC. Do not commit `.env` or the key. The optional `ARC_RPC_URL` defaults to `https://rpc.testnet.arc.io`.

```bash
npm run deploy:arc
```

The deployment script writes the contract address, network, chain ID, and deployment block to `deployments/arcTestnet.json`. Review and commit that public deployment configuration after deploying. Never commit the deployer key.

For local contract tests, use:

```bash
npx hardhat test
```

## Checks

```bash
npx tsc --noEmit
npx hardhat test
npm run build
```
