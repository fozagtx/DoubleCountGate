export function RunNotes() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-page gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-5">
          <p className="eyebrow">For judges</p>
          <h2 className="serif mt-4 text-4xl tracking-tight">Run the lock again.</h2>
          <p className="mt-4 leading-relaxed text-mute">
            The Akofia note in this repo is synthetic. It is not a real project and not a real credit. The fingerprint
            button does not call a model. The reader does, and only when a key is set.
          </p>
        </div>
        <div className="md:col-span-7">
          <ol className="space-y-6 text-sm leading-relaxed">
            <li>
              <span className="eyebrow">Tests and the terminal demo</span>
              <pre className="mt-2 overflow-x-auto bg-ink px-4 py-3 font-mono text-[13px] leading-relaxed text-sheet">{`npm i
npx hardhat test
npm run demo`}</pre>
            </li>
            <li>
              <span className="eyebrow">The web app, against a local chain</span>
              <pre className="mt-2 overflow-x-auto bg-ink px-4 py-3 font-mono text-[13px] leading-relaxed text-sheet">{`npx hardhat node
npm run deploy
npm run dev`}</pre>
              <p className="mt-3 text-mute">
                Use the synthetic fingerprint, then mint with the local issuer. No wallet-cloud signup. Set
                OPENAI_API_KEY or OPENAI_BASE_URL only for the live reader. A browser wallet on chain 31337 can sign
                instead of the local issuer.
              </p>
            </li>
          </ol>
          <p className="mt-8 text-sm leading-relaxed text-mute">
            Built with Solidity, Hardhat, ethers v6, Next.js, Tailwind, wagmi, viem, and an OpenAI-compatible
            chat completions API. No marketplace, no map, no sensor feed. A rewritten document is a different
            fingerprint; this prototype does not fuzzy-match two wordings of one forest.
          </p>
        </div>
      </div>
    </footer>
  );
}
