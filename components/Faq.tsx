import { LeafIcon } from "@/components/Icons";

const questions = [
  {
    q: "What is double counting?",
    a: "It is when one real-world climate result — say, a forest that removed 1,280 tonnes of CO₂ — gets sold as credits twice. Buyers pay twice, but the planet only benefits once.",
  },
  {
    q: "What is a report fingerprint?",
    a: "A short unique code made from the key facts in a monitoring report: project, method, dates, tonnes and report ID. Change any of those and the code changes. Keep them the same and you always get the same code.",
  },
  {
    q: "Does the AI decide what gets issued?",
    a: "No. AI can help read a pasted report and pull out the key facts. It has no wallet and cannot issue anything. If a fact is missing, isn't actually written in the report, or the AI isn't sure, Faircri stops and nothing is issued.",
  },
  {
    q: "Is the Cedar Bend forest real?",
    a: "No. Cedar Bend is an invented example so you can try the full flow safely. Nothing here is a real project or a real credit.",
  },
  {
    q: "What if someone rewrites the report?",
    a: "This version checks the exact key facts. A report with different facts gets a different fingerprint, so it is treated as a different report.",
  },
  {
    q: "Do I need crypto to try it?",
    a: "You need a wallet to approve a credit. Faircri runs on Hoodi, an Ethereum test network. Test ETH has no real-world value.",
  },
];

export function Faq() {
  return (
    <>
      <section id="faq" className="border-t border-line bg-sheet">
        <div className="mx-auto grid max-w-marketing gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-28">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">Questions</p>
            <h2 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[44px]">
              Plain answers.
            </h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {questions.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold">
                  {item.q}
                  <span className="text-xl font-normal text-mute transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-lead">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer id="run" className="border-t border-line">
        <div className="mx-auto flex max-w-marketing flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-forest text-sheet">
              <LeafIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.03em]">faircri</span>
            <span className="ml-2 text-sm text-mute">One report. One credit.</span>
          </div>
          <details className="max-w-md text-sm text-mute">
            <summary className="cursor-pointer font-medium text-lead">For developers: run it yourself</summary>
            <pre className="mt-4 overflow-x-auto rounded-[10px] bg-sand p-4 font-mono text-[12px] leading-relaxed text-ink">{`npm i
npm run deploy:hoodi  # set HOODI_RPC_URL and DEPLOYER_PRIVATE_KEY
npm run dev           # open http://localhost:3000`}</pre>
            <p className="mt-3 leading-relaxed">
              AI reading of pasted reports needs <code className="font-mono text-ink">NEBIUS_API_KEY</code> in{" "}
              <code className="font-mono text-ink">.env</code>. Phone wallets (QR code) need{" "}
              <code className="font-mono text-ink">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>. Everything else works without
              them.
            </p>
          </details>
        </div>
      </footer>
    </>
  );
}
