# Claims

Two claims. Both are enforced in code, and both can be re-run from a clean checkout.

## C1 — A second mint of the same evidence hash always reverts

`CreditRegistry.mint` stores `evidenceHash → creditId`. If that slot is already taken, the transaction reverts with `EVIDENCE_ALREADY_USED` and no second credit is created.

The hash is the sha256 of the canonical field JSON (project, methodology, period, place, tonnes, evidence id). The contract does not care how the hash was produced. It only refuses to store the same `bytes32` twice.

Prove it:

```bash
npx hardhat test
npm run demo
```

The test `reverts the second mint of the same hash` calls `mint` twice with one hash and expects `EVIDENCE_ALREADY_USED`. The demo mints the synthetic Akofia fingerprint, then attempts that same mint twice more, and prints `2/2 double-mints blocked`.

In the web app, a passing read offers **Mint this credit**. After it is issued, **Attempt a second mint** calls the same contract. The panel should read **The chain refused.**

## C2 — The model cannot call mint

The model is asked for JSON only. `lib/model.ts` sends the paperwork to a chat completions endpoint and parses the object. It does not import a signer, a private key, or the registry.

`/api/extract` returns the gate decision. It does not send a transaction.

A mint happens outside the model:

- **Use local issuer** signs with Hardhat’s published test account, and only against a loopback RPC. The key lives in `lib/local-issuer.ts`. The extract route does not import it.
- A browser wallet, through wagmi’s injected connector, can sign instead. No WalletConnect project id is required.
- `npm run extract` (the CLI) signs with `ISSUER_PRIVATE_KEY` only after the gate has already passed. That variable is read in `lib/issuer.ts`, which is imported only by `scripts/extract-and-mint.ts`.

If required fields are missing, a figure is not printed in the note, or confidence is under the line (default 0.80), the gate returns a refusal. The CLI prints `REFUSE` and exits 0. No transaction is sent. The web page says **Not read well enough to mint** and does not enable the mint button.

If `OPENAI_API_KEY` and `OPENAI_BASE_URL` are both unset, the reader throws. The CLI exits non-zero. The page says the reader is not configured and does not invent a report. The synthetic fingerprint button does not call a model; it hashes the sample file.

`test/claims.ts` reads the source of the API routes and the model module and fails if a signer or a mint call appears there.
