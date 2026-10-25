"use client";

import { useEffect, useState } from "react";
import type { GateDecision, GatePass } from "@/lib/gate";
import { IssuePanel } from "@/components/IssuePanel";

type ReadResponse = {
  decision: GateDecision;
  fieldNotes: string | null;
};

type LoudError = {
  message: string;
  code?: string;
};

export function GateApp() {
  const [text, setText] = useState("");
  const [sampleLabel, setSampleLabel] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "reading" | "pass" | "refuse" | "error">("idle");
  const [busyLabel, setBusyLabel] = useState("Reading the paperwork…");
  const [origin, setOrigin] = useState<"model" | "synthetic" | null>(null);
  const [pass, setPass] = useState<GatePass | null>(null);
  const [read, setRead] = useState<ReadResponse | null>(null);
  const [error, setError] = useState<LoudError | null>(null);
  const [modelReady, setModelReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((body: { model?: boolean }) => {
        if (!cancelled) setModelReady(Boolean(body.model));
      })
      .catch(() => {
        if (!cancelled) setModelReady(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadSample(which: "full" | "thin") {
    const res = await fetch(`/api/sample?which=${which}`);
    const body = (await res.json()) as { text: string; label: string };
    setText(body.text);
    setSampleLabel(body.label);
    setRead(null);
    setError(null);
    setOrigin(null);
    setPhase("idle");
  }

  async function onSynthetic() {
    setBusyLabel("Preparing the synthetic fingerprint…");
    setPhase("reading");
    setRead(null);
    setError(null);
    const res = await fetch("/api/synthetic-lock");
    const body = (await res.json()) as Partial<ReadResponse> & {
      error?: string;
      code?: string;
      label?: string;
      decision?: ReadResponse["decision"];
    };
    if (!res.ok || !body.decision?.ok) {
      setPhase("error");
      setError({ message: body.error ?? "The synthetic pack could not be locked.", code: body.code });
      return;
    }
    setRead({ decision: body.decision, fieldNotes: null });
    setPass(body.decision);
    setSampleLabel(body.label ?? "Synthetic fingerprint. No model was called.");
    setOrigin("synthetic");
    setPhase("pass");
  }

  async function onRead() {
    setBusyLabel("Reading the paperwork…");
    setPhase("reading");
    setRead(null);
    setError(null);
    setOrigin(null);
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const body = (await res.json()) as Partial<ReadResponse> & { error?: string; code?: string };
    if (!res.ok || !body.decision) {
      setPhase("error");
      setError({ message: body.error ?? "The reader failed.", code: body.code });
      return;
    }
    setRead({ decision: body.decision, fieldNotes: body.fieldNotes ?? null });
    if (body.decision.ok) setPass(body.decision);
    setOrigin("model");
    setPhase(body.decision.ok ? "pass" : "refuse");
  }

  const decision = read?.decision ?? null;

  return (
    <section id="desk" className="mx-auto max-w-page px-6 py-16 md:px-10 md:py-24">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow">Evidence pack</p>
          <h2 className="serif mt-3 text-4xl tracking-tight md:text-5xl">Read the paperwork. Then decide.</h2>
        </div>
        <p className="text-sm leading-relaxed text-mute md:col-span-5" data-testid="reader-status">
          {modelReady === false
            ? "The reader is optional. Set OPENAI_API_KEY or OPENAI_BASE_URL only if you want a live read. The synthetic fingerprint and the local issuer work without a key. A missing key does not invent a report."
            : modelReady === true
              ? "The reader is a live model call. A weak read stops here. The local issuer, or a browser wallet, signs. The model does not."
              : "Checking whether a model is configured."}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <label className="sr-only" htmlFor="evidence">
            Evidence pack
          </label>
          <textarea
            id="evidence"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSampleLabel(null);
            }}
            placeholder="Paste a monitoring note, or load the synthetic sample."
            className="sheet serif min-h-[22rem] w-full resize-y px-5 py-5 text-lg leading-relaxed text-ink outline-none focus:border-forest"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-forest" onClick={onSynthetic} data-testid="synthetic-lock">
              Use the synthetic fingerprint
            </button>
            <button type="button" className="btn" onClick={() => loadSample("full")}>
              Load synthetic MRV
            </button>
            <button type="button" className="btn" onClick={() => loadSample("thin")}>
              Load a thin note
            </button>
            <button type="button" className="btn btn-forest" onClick={onRead} disabled={!text.trim() || phase === "reading"}>
              {phase === "reading" ? "Reading…" : "Read the paperwork"}
            </button>
          </div>
          {sampleLabel ? <p className="mt-4 text-sm text-mute">{sampleLabel}</p> : null}
        </div>

        <div className="lg:col-span-5">
          {phase === "idle" ? (
            <div className="border border-dashed border-line px-5 py-8 text-mute">
              <p className="serif text-3xl text-ink">Waiting on a read.</p>
              <p className="mt-3 leading-relaxed">
                Required fields are the project, the methodology, the period, the tonnes, and an evidence id. Confidence
                must clear 0.80, and every figure has to be printed in the note.
              </p>
            </div>
          ) : null}

          {phase === "reading" ? (
            <p className="serif text-3xl" data-testid="reading">
              {busyLabel}
            </p>
          ) : null}

          {phase === "error" && error ? (
            <div className="stamp bg-clay px-5 py-8 text-oxide" data-testid="model-missing">
              <p className="eyebrow text-oxide">
                {error.code === "MODEL_NOT_CONFIGURED" ? "Reader not connected" : "Reader failed"}
              </p>
              <h3 className="serif mt-3 text-4xl tracking-tight">
                {error.code === "MODEL_NOT_CONFIGURED" ? "The reader is not connected." : "The read did not finish."}
              </h3>
              <p className="mt-4 leading-relaxed">{error.message}</p>
            </div>
          ) : null}

          {phase === "refuse" && decision && !decision.ok ? (
            <div className="stamp bg-clay px-5 py-8" data-testid="read-refuse">
              <p className="eyebrow text-oxide">No mint offered</p>
              <h3 className="serif mt-3 text-4xl tracking-tight text-oxide">Not read well enough to mint.</h3>
              <p className="mt-4 leading-relaxed text-ink">
                Confidence {formatConfidence(decision.confidence)} · line {decision.threshold.toFixed(2)}. The wallet was
                not asked to sign.
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-relaxed">
                {decision.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              {read?.fieldNotes ? <p className="mt-5 text-sm text-mute">Model note: {read.fieldNotes}</p> : null}
            </div>
          ) : null}

          {phase === "pass" && decision && decision.ok ? (
            <div className="stamp sheet px-5 py-8" data-testid="read-pass">
              <p className="eyebrow text-forest">
                {origin === "synthetic" ? "Synthetic pack · no model call" : "Clear to offer a signature"}
              </p>
              <h3 className="serif mt-3 text-4xl tracking-tight">One fingerprint.</h3>
              <dl className="mt-6 space-y-3 text-sm">
                <Field term="Project" value={decision.fields.projectName} />
                <Field term="Methodology" value={decision.fields.methodology} />
                <Field term="Period" value={decision.fields.reportingPeriod} />
                <Field term="Place" value={decision.fields.geography || "—"} />
                <Field term="Tonnes" value={String(decision.fields.tonnesCo2e)} />
                <Field term="Evidence id" value={decision.fields.evidenceId} />
                <Field
                  term="Confidence"
                  value={`${formatConfidence(decision.confidence)} · line ${decision.threshold.toFixed(2)}`}
                />
              </dl>
              <p className="mt-6 break-all font-mono text-xs leading-relaxed text-mute" data-testid="evidence-hash">
                {decision.hash}
              </p>
              {read?.fieldNotes ? <p className="mt-4 text-sm text-mute">Model note: {read.fieldNotes}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-12">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow">Issue</p>
            <h2 className="serif mt-3 text-4xl tracking-tight md:text-5xl">A person signs. The model does not.</h2>
          </div>
          <p className="text-sm leading-relaxed text-mute md:col-span-5">
            The local issuer is Hardhat’s test account on this machine. A browser wallet can sign instead. Mint once,
            then try the same fingerprint again.
          </p>
        </div>

        <div className="mt-8">
          <IssuePanel ready={pass} />
        </div>
      </div>
    </section>
  );
}

function Field({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-line pb-2">
      <dt className="text-mute">{term}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  );
}

function formatConfidence(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "missing";
  return value.toFixed(2);
}
