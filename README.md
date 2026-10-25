# Each ton, sold once.

Carbon credits only work if each ton is sold once. The same forest or project paperwork can be used to mint two credits today. Buyers lose trust. The damage is done before anyone opens a fraud dashboard.

DoubleCountGate is for the registry that issues the credit. Before a credit exists, the evidence pack is locked to one fingerprint. That fingerprint can be minted once. A second mint of the same evidence is refused.

A language model may help read the paperwork into fields. It never holds the mint key, and it never creates the credit. If the read is incomplete, or the confidence is below the line, the app refuses and nothing is signed. ConnectKit connects the wallet that signs. A text link can use Hardhat’s local account when no browser wallet is installed.

Who it is for: a carbon registry, or a project developer about to issue. What goes wrong today: one monitoring pack, two credits. What this does: stop the second one at the door.

## What you can watch

1. Open the site and use the **ConnectKit** button. A browser wallet on this machine connects without a WalletConnect project id.
2. If you have no browser wallet, use the text link **Use the local Hardhat account**. It is not the main control.
3. **Use the synthetic fingerprint.** That hash is computed from the sample file. No model is called.
4. **Mint this credit.** The credit id comes back **Issued**.
5. **Attempt a second mint.** The chain reverts with `EVIDENCE_ALREADY_USED`. The page says the chain refused.
6. Optionally, **Read the paperwork.** That call needs a model key. If the key is missing, the reader fails loud and invents nothing.

## Re-run

```bash
npm i
npx hardhat test
npm run demo
```

`npm run demo` (or `make demo`) deploys a fresh registry in memory, mints the synthetic Akofia fingerprint, shows the hash, reverts the next two mints of that hash, and refuses a weak read without sending a transaction. The last line is the judge count, in the shape `2/2 double-mints blocked`.

The offline half of the demo computes the fingerprint from the sample’s own fields. It is not a pretend model response. The live model runs when `OPENAI_API_KEY` or `OPENAI_BASE_URL` is set. If neither is set, the demo prints **FAIL LOUD** and does not invent an extraction. `npm run extract` exits non-zero in that case.

## Web app

The page is the primary path. No model key is required for the lock. ConnectKit is the wallet button.

```bash
npx hardhat node
npm run deploy
npm run dev
```

Open the site. Connect with ConnectKit, or follow **Use the local Hardhat account** if you have no browser wallet. Then **Use the synthetic fingerprint**, **Mint this credit**, and **Attempt a second mint**.

WalletConnect’s phone QR needs `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from [WalletConnect Cloud](https://cloud.walletconnect.com). Leave it unset if you do not have one. Do not invent a value. Without it, the QR path is not started, and the ConnectKit button still connects an injected wallet on chain id **31337**, RPC **http://127.0.0.1:8545**.

The local Hardhat account is account #0 (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`), Hardhat’s published test key. It signs only against `localhost` or `127.0.0.1`. Do not fund it. The model is never given the key.

`OPENAI_API_KEY` or `OPENAI_BASE_URL` is only for **Read the paperwork**. If both are missing, that button fails loud and does not invent an extraction. The synthetic fingerprint and the mint buttons keep working.

`npm run extract` is the CLI reader. It signs with `ISSUER_PRIVATE_KEY` only after the gate has passed, and only if you set that variable yourself. A low-confidence read prints `REFUSE` and exits 0. A missing model configuration exits non-zero.

## Real model, synthetic paperwork

The Akofia note in `samples/mrv-akofia-synthetic.txt` is invented. So is the thin note beside it. They are marked synthetic in the file and on the page. There is no live forest, verifier, or registry behind them.

The extraction call is real: OpenAI’s chat completions API, or any compatible `OPENAI_BASE_URL`. Temperature is 0. The app then checks that each required value is actually printed in the note, and that confidence is at least `CONFIDENCE_THRESHOLD` (default **0.80**). Fail either check and the mint button stays closed.

A rewritten document is a different fingerprint. This prototype does not fuzzy-match two wordings of one forest. The lock is exact: the same `bytes32` cannot be minted twice.

## Built with

Solidity, Hardhat, ethers v6, Next.js, Tailwind, ConnectKit, wagmi, viem, and an OpenAI-compatible chat completions endpoint.

Scope is the lock: the registry, the reader, and the wallet signature.

Claims and how they are proven: [CLAIMS.md](CLAIMS.md).
