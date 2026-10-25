import { createHash } from "node:crypto";

export type EvidenceFields = {
  projectName: string;
  methodology: string;
  reportingPeriod: string;
  geography: string;
  tonnesCo2e: number;
  evidenceId: string;
};

export function canonicalEvidence(fields: EvidenceFields): string {
  const payload = {
    evidenceId: fields.evidenceId.trim(),
    geography: fields.geography.trim(),
    methodology: fields.methodology.trim(),
    projectName: fields.projectName.trim(),
    reportingPeriod: fields.reportingPeriod.trim(),
    tonnesCo2e: normalizeTonnes(fields.tonnesCo2e),
  };
  return JSON.stringify(payload);
}

export function evidenceHash(canonical: string): `0x${string}` {
  return `0x${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

function normalizeTonnes(value: number): number {
  return Math.round(value * 10000) / 10000;
}
