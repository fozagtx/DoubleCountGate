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
    <section id="desk" className="border-t border-line">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-2xl font-medium tracking-tight">Evidence.</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-mute" data-testid="reader-status">
          {modelReady === false
            ? "The reader is optional. Set OPENAI_API_KEY or OPENAI_BASE_URL to read a note. If both are missing, that button fails and invents nothing. The synthetic fingerprint does not call a model."
            : modelReady === true
              ? "A live model can read the note. Below the line, nothing is offered to the wallet."
              : "Checking whether a model is configured."}
        </p>

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
          placeholder="Paste a monitoring note, or use the synthetic fingerprint."
          className="field mt-10 min-h-[16rem] resize-y px-4 py-4 leading-relaxed"
        />
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="button" className="btn" onClick={onSynthetic} data-testid="synthetic-lock">
            Use the synthetic fingerprint
          </button>
          <button type="button" className="link text-sm" onClick={() => loadSample("full")}>
            Load the sample
          </button>
          <button type="button" className="link text-sm" onClick={() => loadSample("thin")}>
            Load a thin note
          </button>
          <button type="button" className="link text-sm" onClick={onRead} disabled={!text.trim() || phase === "reading"}>
            {phase === "reading" && busyLabel.startsWith("Reading") ? "Reading…" : "Read the paperwork"}
          </button>
        </div>
        {sampleLabel ? <p className="mt-4 text-sm text-mute">{sampleLabel}</p> : null}

        <div className="mt-12">
          {phase === "idle" ? (
            <p className="max-w-xl text-sm leading-relaxed text-mute">
              A passing read needs the project, the methodology, the period, the tonnes, and an evidence id, each printed
              in the note, with confidence at or above 0.80.
            </p>
          ) : null}
          {phase === "reading" ? (
            <p className="text-lg" data-testid="reading">
              {busyLabel}
            </p>
          ) : null}
          {phase === "error" && error ? (
            <div data-testid="model-missing">
              <h3 className="text-3xl font-medium tracking-tight">
                {error.code === "MODEL_NOT_CONFIGURED" ? "The reader is not connected." : "The read did not finish."}
              </h3>
              <p className="mt-4 max-w-xl leading-relaxed text-mute">{error.message}</p>
            </div>
          ) : null}
          {phase === "refuse" && decision && !decision.ok ? (
            <div data-testid="read-refuse">
              <h3 className="text-3xl font-medium tracking-tight">Not read well enough to mint.</h3>
              <p className="mt-4 leading-relaxed text-mute">
                Confidence {formatConfidence(decision.confidence)}. The line is {decision.threshold.toFixed(2)}. The
                wallet was not asked to sign.
              </p>
              <ul className="mt-6 space-y-2 text-sm leading-relaxed">
                {decision.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              {read?.fieldNotes ? <p className="mt-4 text-sm text-mute">Model note: {read.fieldNotes}</p> : null}
            </div>
          ) : null}
          {phase === "pass" && decision && decision.ok ? (
            <div data-testid="read-pass">
              <p className="text-sm text-mute">
                {origin === "synthetic" ? "Synthetic pack. No model was called." : "Clear to offer a signature."}
              </p>
              <h3 className="mt-3 text-3xl font-medium tracking-tight">One fingerprint.</h3>
              <dl className="mt-8 max-w-xl space-y-3 text-sm">
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

      <div className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-2xl font-medium tracking-tight">Mint.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-mute">
            One signature creates the credit. The next attempt with this fingerprint is the refusal.
          </p>
          <div className="mt-10">
            <IssuePanel ready={pass} />
          </div>
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
