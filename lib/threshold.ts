export const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

export function confidenceThreshold(): number {
  const raw = process.env.CONFIDENCE_THRESHOLD?.trim();
  if (!raw) return DEFAULT_CONFIDENCE_THRESHOLD;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new Error(
      `CONFIDENCE_THRESHOLD must be a number greater than 0 and at most 1. Received "${raw}".`,
    );
  }
  return value;
}
