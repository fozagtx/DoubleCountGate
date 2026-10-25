import { canonicalEvidence, evidenceHash, type EvidenceFields } from "./evidence";
import { confidenceThreshold } from "./threshold";

export type ModelExtraction = {
  projectName: string | null;
  methodology: string | null;
  reportingPeriod: string | null;
  geography: string | null;
  tonnesCo2e: number | null;
  evidenceId: string | null;
  confidence: number | null;
  fieldNotes: string | null;
};

export type GatePass = {
  ok: true;
  fields: EvidenceFields;
  canonical: string;
  hash: `0x${string}`;
  confidence: number;
  threshold: number;
  reasons: [];
};

export type GateRefuse = {
  ok: false;
  fields: null;
  canonical: null;
  hash: null;
  confidence: number | null;
  threshold: number;
  reasons: string[];
};

export type GateDecision = GatePass | GateRefuse;

const FIELD_LIMIT = 200;

export function assess(
  source: string,
  model: ModelExtraction,
  threshold = confidenceThreshold(),
): GateDecision {
  const reasons: string[] = [];
  const projectName = groundedText(source, "projectName", model.projectName, reasons);
  const methodology = groundedText(source, "methodology", model.methodology, reasons);
  const reportingPeriod = groundedText(source, "reportingPeriod", model.reportingPeriod, reasons);
  const evidenceId = groundedText(source, "evidenceId", model.evidenceId, reasons);
  const geography = optionalGroundedText(source, "geography", model.geography, reasons);
  const tonnesCo2e = groundedTonnes(source, model.tonnesCo2e, reasons);

  let confidence: number | null = null;
  if (model.confidence === null || !Number.isFinite(model.confidence)) {
    reasons.push("confidence is missing");
  } else if (model.confidence < 0 || model.confidence > 1) {
    reasons.push("confidence is not between 0 and 1");
    confidence = model.confidence;
  } else {
    confidence = model.confidence;
    if (model.confidence < threshold) {
      reasons.push(
        `confidence ${formatConfidence(model.confidence)} is below ${formatConfidence(threshold)}`,
      );
    }
  }

  if (
    reasons.length > 0 ||
    projectName === null ||
    methodology === null ||
    reportingPeriod === null ||
    evidenceId === null ||
    tonnesCo2e === null ||
    confidence === null
  ) {
    return {
      ok: false,
      fields: null,
      canonical: null,
      hash: null,
      confidence,
      threshold,
      reasons,
    };
  }

  const fields: EvidenceFields = {
    projectName,
    methodology,
    reportingPeriod,
    geography: geography ?? "",
    tonnesCo2e,
    evidenceId,
  };
  const canonical = canonicalEvidence(fields);
  return {
    ok: true,
    fields,
    canonical,
    hash: evidenceHash(canonical),
    confidence,
    threshold,
    reasons: [],
  };
}

function groundedText(
  source: string,
  name: string,
  value: string | null,
  reasons: string[],
): string | null {
  if (!value) {
    reasons.push(`${name} is missing`);
    return null;
  }
  if (value.length > FIELD_LIMIT) {
    reasons.push(`${name} is longer than the paperwork this gate will accept`);
    return null;
  }
  if (!sourceIncludes(source, value)) {
    reasons.push(`${name} is not printed in the paperwork`);
    return null;
  }
  return value;
}

function optionalGroundedText(
  source: string,
  name: string,
  value: string | null,
  reasons: string[],
): string | null {
  if (!value) return null;
  if (value.length > FIELD_LIMIT) {
    reasons.push(`${name} is longer than the paperwork this gate will accept`);
    return null;
  }
  if (!sourceIncludes(source, value)) {
    reasons.push(`${name} is not printed in the paperwork`);
    return null;
  }
  return value;
}

function groundedTonnes(source: string, value: number | null, reasons: string[]): number | null {
  if (value === null || !Number.isFinite(value)) {
    reasons.push("tonnesCo2e is missing");
    return null;
  }
  if (value <= 0) {
    reasons.push("tonnesCo2e must be greater than zero");
    return null;
  }
  if (!numberAppears(source, value)) {
    reasons.push(`tonnesCo2e ${value} is not printed in the paperwork`);
    return null;
  }
  return value;
}

function sourceIncludes(source: string, value: string): boolean {
  return normalize(source).includes(normalize(value));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function numberAppears(source: string, value: number): boolean {
  const compact = source.replace(/,/g, "");
  const candidates = new Set<string>([
    String(value),
    value.toFixed(1),
    value.toFixed(2),
    value.toFixed(4).replace(/0+$/, "").replace(/\.$/, ""),
    String(Math.trunc(value)),
  ]);
  for (const candidate of candidates) {
    if (candidate && compact.includes(candidate)) return true;
  }
  return false;
}

function formatConfidence(value: number): string {
  return value.toFixed(2);
}
