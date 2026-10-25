"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { GateDecision, GatePass } from "@/lib/gate";
import { IssuePanel } from "@/components/IssuePanel";
import { AlertIcon, CheckIcon, CopyIcon, DocIcon, LeafIcon, SparkIcon } from "@/components/Icons";
import { Banner, Spinner } from "@/components/ui";

type ReadResponse = {
  decision: GateDecision;
  fieldNotes: string | null;
};

type LoudError = {
  message: string;
  code?: string;
};

type Source = "example" | "thin" | "own";

const sources: { id: Source; title: string; body: string; icon: typeof LeafIcon }[] = [
  {
    id: "example",
    title: "Cedar Bend forest",
    body: "A complete example report. Checked instantly — no AI needed.",
    icon: LeafIcon,
  },
  {
    id: "thin",
    title: "An incomplete note",
    body: "An example that's missing key facts. See how it gets stopped.",
    icon: AlertIcon,
  },
  {
    id: "own",
    title: "Paste your own",
    body: "Paste any monitoring report. AI pulls out the key facts.",
    icon: DocIcon,
  },
];

export function GateApp() {
  const [source, setSource] = useState<Source>("example");
  const [text, setText] = useState("");
  const [exampleText, setExampleText] = useState("");
  const [phase, setPhase] = useState<"idle" | "reading" | "pass" | "refuse" | "error">("idle");
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
    fetch("/api/sample?which=full")
      .then((res) => res.json())
      .then((body: { text: string }) => {
        if (!cancelled) setExampleText(body.text);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function reset() {
    setRead(null);
    setError(null);
    setOrigin(null);
    setPass(null);
    setPhase("idle");
  }

  async function choose(next: Source) {
    setSource(next);
    reset();
    if (next === "thin") {
      const res = await fetch("/api/sample?which=thin");
      const body = (await res.json()) as { text: string };
      setText(body.text);
    } else if (next === "own") {
      setText("");
    }
  }

  async function checkExample() {
    setPhase("reading");
    setRead(null);
    setError(null);
    const which = source === "thin" ? "thin" : "full";
    const res = await fetch(`/api/synthetic-lock?which=${which}`);
    const body = (await res.json()) as Partial<ReadResponse> & {
      error?: string;
      code?: string;
      decision?: ReadResponse["decision"];
    };
    if (!res.ok || !body.decision) {
      setPhase("error");
      setError({ message: body.error ?? "The example report could not be checked.", code: body.code });
      return;
    }
    setRead({ decision: body.decision, fieldNotes: null });
    if (body.decision.ok) setPass(body.decision);
    setOrigin("synthetic");
    setPhase(body.decision.ok ? "pass" : "refuse");
  }

  async function checkWithAi() {
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
      setError({ message: body.error ?? "The report could not be read.", code: body.code });
      return;
    }
    setRead({ decision: body.decision, fieldNotes: body.fieldNotes ?? null });
    if (body.decision.ok) setPass(body.decision);
    setOrigin("model");
    setPhase(body.decision.ok ? "pass" : "refuse");
  }

  const aiOff = source === "own" && modelReady === false;
  const canCheck =
    phase !== "reading" && !aiOff && (source === "example" || source === "thin" || text.trim().length > 0);
  const decision = read?.decision ?? null;

  return (
    <section className="mx-auto max-w-desk px-0 py-2 md:px-0 md:py-2">
      <div>
        <div className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">Three steps</p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[48px]">
            Check a report before issuing a credit.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-lead">
            Start with a clearly marked example report, or paste your own. Hoodi is a public test network; test ETH has no real-world value.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <Step number={1} title="Pick a report" done={phase === "pass" || phase === "refuse"}>
            <div className="grid gap-3 sm:grid-cols-3" role="group" aria-label="Report to check">
              {sources.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="choice"
                  aria-pressed={source === item.id}
                  onClick={() => choose(item.id)}
                  data-testid={`source-${item.id}`}
                >
                  <item.icon className="h-5 w-5 text-forest" />
                  <span className="mt-1 text-[15px] font-semibold text-ink">{item.title}</span>
                  <span className="text-[13px] leading-snug text-mute">{item.body}</span>
                </button>
              ))}
            </div>

            {source === "example" ? (
              <details className="mt-4 rounded-[12px] border border-line bg-paper px-4 py-3 text-sm">
                <summary className="cursor-pointer font-medium text-lead">Read the Cedar Bend report</summary>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-lead">
                  {exampleText || "Loading…"}
                </pre>
              </details>
            ) : source === "thin" ? (
              <details className="mt-4 rounded-[12px] border border-line bg-paper px-4 py-3 text-sm">
                <summary className="cursor-pointer font-medium text-lead">Read the incomplete note</summary>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-lead">
                  {text || "Loading…"}
                </pre>
              </details>
            ) : (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-lead" htmlFor="evidence">
                  Your monitoring report
                </label>
                <textarea
                  id="evidence"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    reset();
                  }}
                  placeholder="Paste the report text here — project name, method, monitoring period, tonnes of CO₂ and report ID."
                  className="field min-h-[11rem] resize-y px-4 py-3 text-[15px] leading-relaxed"
                />
              </div>
            )}

            {aiOff ? (
              <p
                className="mt-4 flex items-start gap-2 rounded-[10px] bg-sand px-4 py-3 text-sm leading-relaxed text-lead"
                data-testid="reader-status"
              >
                <SparkIcon className="mt-0.5 h-4 w-4 shrink-0" />
                AI reading isn&apos;t set up on this site yet.
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="btn w-full sm:w-auto"
                disabled={!canCheck}
                onClick={source === "own" ? checkWithAi : checkExample}
                data-testid={source === "example" ? "synthetic-lock" : "read"}
              >
                {phase === "reading" ? (
                  <>
                    <Spinner /> Checking the report…
                  </>
                ) : (
                  "Check this report"
                )}
              </button>
              <p className="text-[13px] text-mute">
                {source === "example"
                  ? "Uses the facts written in the example. No AI."
                  : source === "thin"
                    ? "This incomplete example is checked without AI."
                    : "AI reads the report. It can't issue anything."}
              </p>
            </div>
          </Step>

          <Step number={2} title="See what we found" done={phase === "pass"} muted={phase === "idle"}>
            {phase === "idle" ? (
              <p className="text-[15px] text-mute">Check a report and the results show up here.</p>
            ) : null}
            {phase === "reading" ? (
              <p className="flex items-center gap-2 text-[15px] text-lead" data-testid="reading">
                <Spinner /> Reading the key facts…
              </p>
            ) : null}
            {phase === "error" && error ? (
              <Banner tone="bad" testId="model-missing" title="We couldn't check this report">
                {friendlyError(error)}
              </Banner>
            ) : null}
            {phase === "refuse" && decision && !decision.ok ? (
              <div data-testid="read-refuse">
                <Banner tone="bad" title="This report can't back a credit yet">
                  Nothing was issued. Here&apos;s what&apos;s missing:
                </Banner>
                <ul className="mt-4 space-y-2">
                  {decision.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-[15px] text-ink">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden />
                      {friendlyReason(reason, decision.threshold, origin)}
                    </li>
                  ))}
                </ul>
                {read?.fieldNotes ? <p className="mt-4 text-sm text-mute">AI note: {read.fieldNotes}</p> : null}
              </div>
            ) : null}
            {phase === "pass" && decision && decision.ok ? (
              <div data-testid="read-pass">
                <Banner tone="good" title="This report has everything it needs">
                  {origin === "synthetic"
                    ? "All key facts are written in the report."
                    : `All key facts are written in the report. The AI was ${percent(decision.confidence)} sure.`}
                </Banner>
                <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Fact term="Project" value={decision.fields.projectName} />
                  <Fact term="Carbon removed" value={`${decision.fields.tonnesCo2e.toLocaleString("en-US")} tonnes CO₂`} />
                  <Fact term="Monitoring period" value={decision.fields.reportingPeriod} />
                  <Fact term="Method" value={decision.fields.methodology} />
                  {decision.fields.geography ? <Fact term="Location" value={decision.fields.geography} /> : null}
                  <Fact term="Report ID" value={decision.fields.evidenceId} />
                </dl>
                <Fingerprint hash={decision.hash} />
                {read?.fieldNotes ? <p className="mt-4 text-sm text-mute">AI note: {read.fieldNotes}</p> : null}
              </div>
            ) : null}
          </Step>

          <Step number={3} title="Issue the credit" muted={!pass}>
            <IssuePanel ready={pass} />
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  done = false,
  muted = false,
  children,
}: {
  number: number;
  title: string;
  done?: boolean;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-[18px] border border-line bg-sheet p-5 shadow-card md:p-7 ${muted ? "opacity-80" : ""}`}>
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
            done ? "bg-forest text-sheet" : "bg-sand text-ink"
          }`}
        >
          {done ? <CheckIcon className="h-4 w-4" /> : number}
        </span>
        <h3 className="font-display text-[20px] font-semibold tracking-[-0.02em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="border-b border-line pb-3">
      <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mute">{term}</dt>
      <dd className="mt-1 text-[15px] font-medium text-ink">{value}</dd>
    </div>
  );
}

function Fingerprint({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 rounded-[12px] border border-dashed border-[#d6cbb5] bg-paper px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-ink">Report fingerprint</p>
          <p className="mt-0.5 text-[13px] text-mute">A unique code made from the facts above. Same facts, same code.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-lead hover:bg-sand"
          onClick={() => {
            navigator.clipboard?.writeText(hash).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          <CopyIcon className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-3 break-all font-mono text-[12px] leading-relaxed text-lead" data-testid="evidence-hash">
        {hash}
      </p>
    </div>
  );
}

const FIELD_LABEL: Record<string, string> = {
  projectName: "Project name",
  methodology: "Method",
  reportingPeriod: "Monitoring period",
  geography: "Location",
  tonnesCo2e: "Tonnes of CO₂",
  evidenceId: "Report ID",
};

function friendlyReason(reason: string, threshold: number, origin: "model" | "synthetic" | null): string {
  const confidence = reason.match(/^confidence ([\d.]+) is below/);
  if (confidence) {
    if (origin === "synthetic") {
      return `This example's confidence value is below the required ${percent(threshold)}.`;
    }
    return `The AI was only ${percent(Number(confidence[1]))} sure about these facts (it needs ${percent(threshold)}).`;
  }
  if (reason === "confidence is missing") {
    return origin === "synthetic" ? "This example doesn't include a confidence value." : "The AI couldn't say how sure it was.";
  }
  if (reason === "confidence is not between 0 and 1") {
    return origin === "synthetic" ? "This example has an unusable confidence value." : "The AI gave an unusable answer about how sure it was.";
  }
  const [field, ...rest] = reason.split(" ");
  const label = FIELD_LABEL[field];
  if (!label) return reason;
  const tail = rest.join(" ");
  if (tail === "is missing") return `${label} is missing.`;
  if (tail === "must be greater than zero") return `${label} must be more than zero.`;
  if (tail.includes("longer than")) return `${label} is too long to be a real value.`;
  const value = tail.match(/^([\d.]+) is not printed/);
  if (value) return `${label} (${value[1]}) isn't actually written in the report.`;
  if (tail.includes("not printed")) return `${label} isn't actually written in the report.`;
  return reason;
}

function friendlyError(error: LoudError): string {
  if (error.code === "MODEL_NOT_CONFIGURED") {
    return "AI reading isn't set up on this site yet.";
  }
  if (error.code === "MODEL_FAILED") {
    return "The AI service didn't respond properly. Please try again in a moment.";
  }
  return error.message;
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${Math.round(value * 100)}%`;
}
