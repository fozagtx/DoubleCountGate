import type { ModelExtraction } from "./gate";

const SYSTEM_PROMPT = `You read carbon-credit monitoring (MRV) paperwork and extract only what is written.
Return a single JSON object with these keys:
projectName (string or null),
methodology (string or null),
reportingPeriod (string or null),
geography (string or null),
tonnesCo2e (number or null),
evidenceId (string or null),
confidence (number from 0 to 1),
fieldNotes (string).

Rules:
- Copy values from the document. Do not guess, round, or fill gaps from general knowledge.
- If a field is not explicitly printed, set it to null.
- tonnesCo2e must be a number that appears in the document. If it does not, use null.
- confidence is how sure you are that every required field is explicit and that this pack identifies one issuance.
- Required fields are projectName, methodology, reportingPeriod, tonnesCo2e, and evidenceId.
- Incomplete or vague packs must score confidence at or below 0.4.
- You cannot mint, sign, or create a credit. Do not propose a transaction.`;

export class ModelConfigError extends Error {
  code = "MODEL_NOT_CONFIGURED";
}

export type ModelConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
};

export function modelConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ModelConfig {
  const apiKey = env.NEBIUS_API_KEY?.trim() ?? "";
  if (!apiKey) {
    throw new ModelConfigError(
      "AI reading isn't set up on this site yet.",
    );
  }
  return {
    apiKey,
    baseURL: (env.NEBIUS_BASE_URL?.trim() || "https://api.tokenfactory.nebius.com/v1").replace(/\/$/, ""),
    model: env.NEBIUS_MODEL?.trim() || "meta-llama/Llama-3.3-70B-Instruct",
  };
}

export async function readModel(source: string, env: NodeJS.ProcessEnv = process.env): Promise<ModelExtraction> {
  const config = modelConfigFromEnv(env);
  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: source },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Model request failed (${response.status}). ${detail.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("The model returned an empty message. No credit fields were invented.");
  }
  return parseExtraction(content);
}

export function parseExtraction(raw: string): ModelExtraction {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("The model did not return JSON. No credit fields were invented.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The model did not return a JSON object. No credit fields were invented.");
  }

  const record = data as Record<string, unknown>;
  return {
    projectName: asString(record.projectName),
    methodology: asString(record.methodology),
    reportingPeriod: asString(record.reportingPeriod),
    geography: asString(record.geography),
    tonnesCo2e: asNumber(record.tonnesCo2e),
    evidenceId: asString(record.evidenceId),
    confidence: asNumber(record.confidence),
    fieldNotes: asString(record.fieldNotes),
  };
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
