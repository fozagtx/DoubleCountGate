# Claims

## C1 — A second mint of the same report fingerprint is refused

`CreditRegistry.mint` stores `evidenceHash → creditId`. If that fingerprint already exists, the transaction reverts with `EVIDENCE_ALREADY_USED` and no second credit is created.

The hash is the SHA-256 of canonical report fields: project, method, period, place, tonnes, and report ID. The contract checks the hash; it does not verify the real-world claims in the report.

Run `npx hardhat test` to verify that a second mint with the same hash reverts.

## C2 — AI cannot issue a credit

The Nebius model reads pasted report text and returns extracted fields. `/api/extract` applies the evidence gate and returns a decision; it cannot send a transaction.

To issue a credit, the connected wallet must approve a transaction on Arc Testnet. Network fees use native test USDC. The browser has no built-in test wallet. The model receives no signing key.

If required fields are missing, a value is not printed in the report, or confidence is below the configured threshold (default `0.80`), the gate refuses and no issue action is offered. The synthetic examples use local sample files and do not call a model.

AI report reading requires `NEBIUS_API_KEY`. Without it, the app says “AI reading isn't set up on this site yet”; the synthetic examples remain available.
