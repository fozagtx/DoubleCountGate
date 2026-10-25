export function Story() {
  return (
    <div id="top">
      <section className="mx-auto max-w-marketing px-6 pb-16 pt-20 md:pt-24">
        <p className="text-sm font-medium text-mute">Carbon credit registries</p>
        <h1 className="mt-5 max-w-2xl font-display text-[44px] font-medium leading-[1.08] tracking-[-0.02em] text-ink md:text-[56px]">
          Stop the same evidence pack from minting two credits
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-lead md:text-xl md:leading-snug">
          If two desks issue a credit from the same monitoring pack, buyers cannot trust the market. DoubleCountGate
          hashes the pack into one evidence fingerprint before mint. The first mint succeeds. A second mint of that
          fingerprint reverts on-chain.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="#desk" className="btn">
            Open the desk
          </a>
          <a href="#run" className="text-sm font-medium text-ink underline decoration-line underline-offset-[3px]">
            How to run locally
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-marketing px-6 pb-24" aria-hidden="true">
        <div className="panel overflow-hidden" data-testid="desk-preview">
          <div className="flex items-center justify-between border-b border-line bg-sand px-5 py-3">
            <p className="text-sm font-medium">Evidence pack</p>
            <p className="text-xs text-mute">Preview · not a live signature</p>
          </div>
          <div className="grid md:grid-cols-[1.45fr_0.85fr]">
            <div className="border-b border-line p-5 md:border-b-0 md:border-r">
              <div className="min-h-[168px] rounded-xl border border-line bg-sheet px-4 py-4 text-sm leading-relaxed text-lead">
                <p>Project: Akofia Community Woodlot</p>
                <p>Methodology: VM0012-demo</p>
                <p>Period: 2024-01-01 to 2024-12-31</p>
                <p>Tonnes: 1280.5</p>
                <p>Evidence id: SYN-MRV-AKOFIA-2024-A</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-sheet p-5">
              <div>
                <p className="text-xs font-medium text-mute">Fingerprint</p>
                <p className="mt-2 break-all font-mono text-xs leading-relaxed text-ink">
                  0xf48681299fb4d4904e7be0cdbe66ceb599593930c2538e6f2580f17dd7ce6ac8
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex min-h-11 items-center rounded-xl bg-forest px-4 text-sm font-medium text-sheet">
                  Mint this credit
                </span>
                <p className="mt-3 text-xs leading-relaxed text-mute">Second attempt of this hash reverts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-marketing px-6 py-24">
          <h2 className="font-display text-[28px] font-medium leading-tight tracking-[-0.02em]">How it works</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="rounded-[14px] border border-line bg-white p-6">
              <p className="text-xs font-medium text-mute">1</p>
              <h3 className="mt-3 text-base font-medium">Problem</h3>
              <p className="mt-2 text-sm leading-relaxed text-lead">
                One pack reaches two desks. Each desk can mint a ton.
              </p>
            </article>
            <article className="rounded-[14px] border border-line bg-white p-6">
              <p className="text-xs font-medium text-mute">2</p>
              <h3 className="mt-3 text-base font-medium">Fingerprint</h3>
              <p className="mt-2 text-sm leading-relaxed text-lead">
                Required fields become one sha256. The registry stores it once. A repeat reverts with
                EVIDENCE_ALREADY_USED.
              </p>
            </article>
            <article className="rounded-[14px] border border-line bg-white p-6">
              <p className="text-xs font-medium text-mute">3</p>
              <h3 className="mt-3 text-base font-medium">Who signs</h3>
              <p className="mt-2 text-sm leading-relaxed text-lead">
                The model returns fields and a confidence score. Your connected wallet signs the mint, or nobody does.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
