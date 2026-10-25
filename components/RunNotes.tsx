export function RunNotes() {
  return (
    <footer id="run" className="border-t border-line">
      <div className="mx-auto max-w-desk px-6 py-24">
        <h2 className="text-2xl font-medium tracking-tight">Run locally</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-mute">
          The synthetic Cedar Bend note is not a real project. The synthetic fingerprint button does not call a model.
          Read the paperwork needs OPENAI_API_KEY or OPENAI_BASE_URL.
        </p>
        <pre className="mt-10 overflow-x-auto font-mono text-[13px] leading-relaxed text-ink">{`npm i
npx hardhat test
npm run demo

npx hardhat node
npm run deploy
npm run dev`}</pre>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-mute">
          Connect with the ConnectKit button. WalletConnect QR needs NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Leave it
          empty if you do not have one. A browser wallet on chain 31337 connects without it. With no browser wallet, use
          the text link for the local Hardhat account. Set OPENAI_API_KEY or OPENAI_BASE_URL only for the live reader.
        </p>
        <p className="mt-10 text-sm leading-relaxed text-mute">
          Stack: Solidity, Hardhat, ethers v6, Next.js, Tailwind, ConnectKit, wagmi, viem, OpenAI-compatible chat
          completions.
        </p>
      </div>
    </footer>
  );
}
