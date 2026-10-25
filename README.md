# Faircri

Faircri helps people check environmental reports and issue a public registry record for a report that meets the stated checks. It is an early prototype: credits are test-network records, not financial products or proof that a project is true.

## The app

- `/` explains the service and links to the app.
- Connect a real wallet to open `/dashboard`.
- Use Overview to see Hoodi balance and credits issued by the connected wallet.
- Use Check a report to read one of the clearly marked examples or paste a report for AI reading.
- Use My credits to review, retire, or flag credits issued by that wallet.
- Use Check a fingerprint to look up a report fingerprint in the registry.

The app uses the public **Ethereum Hoodi test network** (chain ID `560048`). Hoodi ETH is test ETH and has no real-world value. Connect your own wallet; the app does not provide a test wallet. If you need test ETH, use the [Hoodi faucet](https://hoodi-faucet.pk910.de).

Until a registry contract has been deployed, `deployments/hoodi.json` contains a null address and on-chain actions are unavailable. Once deployed, the app reads that committed file for the registry address and deployment block.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The app defaults to the Hoodi RPC in `lib/chain.ts`; set `NEXT_PUBLIC_RPC_URL` in `.env` only if you need an override. WalletConnect QR support additionally needs `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`; injected browser wallets can connect without it.

## AI report reading

Pasted reports are read with Nebius. Set `NEBIUS_API_KEY` in `.env` to enable this path. The optional `NEBIUS_BASE_URL` and `NEBIUS_MODEL` defaults are:

```dotenv
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEBIUS_MODEL=meta-llama/Llama-3.3-70B-Instruct
```

Without the API key, the app says **“AI reading isn't set up on this site yet”**; the clearly labeled synthetic examples remain available. Example reports and their extracted fields are sample data, not claims about real projects.

## Deploy the Hoodi registry

Set `DEPLOYER_PRIVATE_KEY` in your local `.env` to a funded Hoodi deployer account. Do not commit `.env` or the key. The optional `HOODI_RPC_URL` defaults to `https://rpc.hoodi.ethpandaops.io`.

```bash
npm run deploy:hoodi
```

The deployment script writes the contract address, network, chain ID, and deployment block to `deployments/hoodi.json`. Review and commit that public deployment configuration after deploying. Never commit the deployer key.

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
