import fs from "node:fs";
import path from "node:path";
import { expect } from "chai";
import { assess, type ModelExtraction } from "../lib/gate";
import { canonicalEvidence, evidenceHash } from "../lib/evidence";
import { parseExtraction, ModelConfigError, modelConfigFromEnv } from "../lib/model";

const root = process.cwd();

function read(relative: string): string {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const fixture = JSON.parse(read("samples/cedarbend-fields.json")) as ModelExtraction;

describe("evidence gate", () => {
  const source = read("samples/mrv-cedarbend-synthetic.txt");
  const thin = read("samples/mrv-thin-synthetic.txt");

  it("accepts a grounded read at or above the line", () => {
    const decision = assess(source, fixture, 0.8);
    expect(decision.ok).to.equal(true);
    if (!decision.ok) return;
    expect(decision.hash).to.match(/^0x[0-9a-f]{64}$/);
    expect(decision.confidence).to.equal(0.93);
    const again = evidenceHash(canonicalEvidence(decision.fields));
    expect(again).to.equal(decision.hash);
  });

  it("refuses when confidence is below the line", () => {
    const decision = assess(source, { ...fixture, confidence: 0.22 }, 0.8);
    expect(decision.ok).to.equal(false);
    if (decision.ok) return;
    expect(decision.hash).to.equal(null);
    expect(decision.reasons.join(" ")).to.match(/below 0\.80/);
  });

  it("refuses invented fields that are not printed in the paperwork", () => {
    const decision = assess(
      thin,
      {
        projectName: "River Trees",
        methodology: "VM0012-demo",
        reportingPeriod: "2024",
        geography: null,
        tonnesCo2e: 5000,
        evidenceId: "SYN-MADE-UP",
        confidence: 0.99,
        fieldNotes: null,
      },
      0.8,
    );
    expect(decision.ok).to.equal(false);
    if (decision.ok) return;
    expect(decision.reasons.join(" | ")).to.match(/not printed/);
    expect(decision.reasons.join(" | ")).to.match(/tonnesCo2e 5000/);
  });

  it("refuses the thin sample when the model leaves the blanks empty", () => {
    const decision = assess(
      thin,
      {
        projectName: null,
        methodology: null,
        reportingPeriod: null,
        geography: null,
        tonnesCo2e: null,
        evidenceId: null,
        confidence: 0.2,
        fieldNotes: "incomplete",
      },
      0.8,
    );
    expect(decision.ok).to.equal(false);
  });

  it("parses a fenced model payload and ignores nothing into a credit", () => {
    const parsed = parseExtraction(
      '```json\n{"projectName":"Cedar Bend Afforestation Pilot","tonnesCo2e":"1280.5","confidence":0.9,"fieldNotes":""}\n```',
    );
    expect(parsed.projectName).to.equal("Cedar Bend Afforestation Pilot");
    expect(parsed.tonnesCo2e).to.equal(1280.5);
    expect(parsed.methodology).to.equal(null);
    expect(parsed.fieldNotes).to.equal(null);
  });

  it("requires a Nebius API key for AI report reading and uses Nebius defaults", () => {
    expect(() => modelConfigFromEnv({ NODE_ENV: "test" })).to.throw(
      ModelConfigError,
      "AI reading isn't set up on this site yet.",
    );
    expect(modelConfigFromEnv({ NODE_ENV: "test", NEBIUS_API_KEY: "test-key" })).to.deep.equal({
      apiKey: "test-key",
      baseURL: "https://api.tokenfactory.nebius.com/v1",
      model: "meta-llama/Llama-3.3-70B-Instruct",
    });
  });
});
