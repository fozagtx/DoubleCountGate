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

const DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct";
const MODEL_PREFERENCES = [
  "meta-llama/Llama-3.3-70B-Instruct",
  "meta-llama/Llama-3.3-70B-Instruct-fast",
  "Qwen/Qwen3-235B-A22B-Instruct-2507",
  "deepseek-ai/DeepSeek-V3-0324",
  "openai/gpt-oss-120b",
  "Qwen/Qwen2.5-72B-Instruct",
  "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
  "meta-llama/Meta-Llama-3.1-8B-Instruct",
];

let resolvedModelCache: { key: string; id: string } | null = null;

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
    model: env.NEBIUS_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export async function readModel(source: string, env: NodeJS.ProcessEnv = process.env): Promise<ModelExtraction> {
  const config = modelConfigFromEnv(env);
  const explicitModel = env.NEBIUS_MODEL?.trim();
  let model = explicitModel || await resolveModel(config);
  let includeResponseFormat = true;
  let retriedResponseFormat = false;
  let retriedModel = false;
  let response = await requestCompletion(config, model, source, includeResponseFormat);

  while (!response.ok) {
    const detail = await response.text();
    if (
      !explicitModel &&
      !retriedModel &&
      isModelAccessError(response.status, detail, model)
    ) {
      retriedModel = true;
      clearResolvedModelCache(config, model);
      model = await resolveModel(config, new Set([model]));
      response = await requestCompletion(config, model, source, includeResponseFormat);
      continue;
    }
    if (
      !retriedResponseFormat &&
      response.status === 400 &&
      detail.toLowerCase().includes("response_format")
    ) {
      retriedResponseFormat = true;
      includeResponseFormat = false;
      response = await requestCompletion(config, model, source, includeResponseFormat);
      continue;
    }
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

async function requestCompletion(
  config: ModelConfig,
  model: string,
  source: string,
  includeResponseFormat: boolean,
): Promise<Response> {
  return fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      ...(includeResponseFormat ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: source },
      ],
    }),
  });
}

async function resolveModel(
  config: ModelConfig,
  excluded: ReadonlySet<string> = new Set(),
): Promise<string> {
  const key = `${config.baseURL}\u0000${config.apiKey}`;
  if (excluded.size === 0 && resolvedModelCache?.key === key) {
    return resolvedModelCache.id;
  }

  let model = config.model;
  try {
    const response = await fetch(`${config.baseURL}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (response.ok) {
      const payload = (await response.json()) as { data?: Array<{ id?: unknown }> };
      const ids = Array.isArray(payload.data)
        ? payload.data.flatMap((item) => (typeof item?.id === "string" ? [item.id] : []))
        : [];
      model = chooseAvailableModel(ids, excluded) ?? config.model;
    }
  } catch {
    model = config.model;
  }

  resolvedModelCache = { key, id: model };
  return model;
}

function chooseAvailableModel(ids: string[], excluded: ReadonlySet<string>): string | null {
  const available = ids.filter((id) => !excluded.has(id));
  for (const preferred of MODEL_PREFERENCES) {
    if (available.includes(preferred)) return preferred;
  }

  return (
    available.find((id) => {
      const normalized = id.toLowerCase();
      return (
        normalized.includes("instruct") &&
        !normalized.includes("embed") &&
        !normalized.includes("vision") &&
        !normalized.includes("guard")
      );
    }) ??
    available[0] ??
    null
  );
}

function clearResolvedModelCache(config: ModelConfig, failedModel: string): void {
  const key = `${config.baseURL}\u0000${config.apiKey}`;
  if (resolvedModelCache?.key === key && resolvedModelCache.id === failedModel) {
    resolvedModelCache = null;
  }
}

function isModelAccessError(status: number, detail: string, model: string): boolean {
  const normalized = detail.toLowerCase();
  return (
    (status === 403 || status === 404) &&
    (normalized.includes("model") || normalized.includes(model.toLowerCase()))
  );
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
    const object = firstJsonObject(cleaned);
    if (!object) {
      throw new Error("The model did not return JSON. No credit fields were invented.");
    }
    try {
      data = JSON.parse(object);
    } catch {
      throw new Error("The model did not return JSON. No credit fields were invented.");
    }
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

function firstJsonObject(value: string): string | null {
  const start = value.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
    } else if (character === '"') {
      inString = true;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, index + 1);
    }
  }
  return null;
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
