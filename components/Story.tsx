export function Story() {
  return (
    <div id="top">
      <section className="mx-auto max-w-page px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <p className="eyebrow">For the registry that issues the credit</p>
        <h1 className="display mt-6 max-w-5xl text-[clamp(3.5rem,8.4vw,7.4rem)] text-ink">
          Each ton
          <br />
          <em>sold once.</em>
        </h1>
        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <p className="max-w-xl text-xl leading-relaxed text-ink md:col-span-7 md:text-2xl">
            Carbon credits only work if each ton is sold once. The same forest paperwork can be used to mint two
            credits today. Buyers lose trust. The damage is done before a fraud report is opened.
          </p>
          <p className="text-base leading-relaxed text-mute md:col-span-4 md:col-start-9 md:pt-2">
            DoubleCountGate locks the evidence to one fingerprint before a credit exists. The same fingerprint is
            refused the second time. A model may help read the file. It does not create the credit, and it never holds
            the key.
          </p>
        </div>
      </section>

      <section className="border-y border-line">
        <div className="mx-auto grid max-w-page md:grid-cols-3">
          <article id="gap" className="border-line px-6 py-12 md:border-r md:px-10 md:py-16">
            <p className="serif text-4xl italic text-mute">01</p>
            <h2 className="serif mt-6 text-3xl tracking-tight">The gap</h2>
            <p className="mt-4 leading-relaxed text-mute">
              One project file, two desks. Each desk mints a ton. The buyer cannot tell which ton is the ton. Most
              tools notice only after both sales exist.
            </p>
          </article>
          <article id="lock" className="border-t border-line px-6 py-12 md:border-r md:border-t-0 md:px-10 md:py-16">
            <p className="serif text-4xl italic text-mute">02</p>
            <h2 className="serif mt-6 text-3xl tracking-tight">The lock</h2>
            <p className="mt-4 leading-relaxed text-mute">
              The pack becomes one fingerprint: a sha256 of its canonical fields, kept beside the credit. The registry
              is a Solidity contract. A second mint reverts with EVIDENCE_ALREADY_USED.
            </p>
          </article>
          <article id="clerk" className="border-t border-line px-6 py-12 md:border-t-0 md:px-10 md:py-16">
            <p className="serif text-4xl italic text-mute">03</p>
            <h2 className="serif mt-6 text-3xl tracking-tight">The clerk</h2>
            <p className="mt-4 leading-relaxed text-mute">
              The model reads the note into fields and a confidence score. Below the line, it stops. The local issuer
              signs the mint, or a browser wallet on this machine does. The model does not.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
