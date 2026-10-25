export function Story() {
  return (
    <section id="top" className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:pt-32">
      <p className="text-sm text-mute">For the registry that issues the credit</p>
      <h1 className="mt-6 max-w-xl text-5xl font-medium tracking-tight text-ink md:text-6xl md:leading-[1.05]">
        Each ton, sold once.
      </h1>
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-mute">
        Carbon credits only work if each ton is sold once. The same forest paperwork can mint two credits today. Buyers
        lose trust before anyone opens a report.
      </p>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink">
        DoubleCountGate locks the pack to one fingerprint. The second mint is refused. A model may read the file. It
        never holds the key.
      </p>
      <dl className="mt-16 max-w-xl space-y-6 text-sm leading-relaxed">
        <div>
          <dt className="font-medium">The gap</dt>
          <dd className="mt-1 text-mute">One project file reaches two desks. Each desk mints a ton.</dd>
        </div>
        <div>
          <dt className="font-medium">The lock</dt>
          <dd className="mt-1 text-mute">
            The fields become one sha256. The registry stores it once. A repeat reverts with EVIDENCE_ALREADY_USED.
          </dd>
        </div>
        <div>
          <dt className="font-medium">The clerk</dt>
          <dd className="mt-1 text-mute">The model returns fields and a confidence score. Your wallet signs, or nobody does.</dd>
        </div>
      </dl>
    </section>
  );
}
