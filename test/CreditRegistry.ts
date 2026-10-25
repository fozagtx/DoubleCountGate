import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const Status = { None: 0, Issued: 1, Retired: 2, Contested: 3 } as const;

async function deploy() {
  const [issuer, other] = await ethers.getSigners();
  const registry = await ethers.deployContract("CreditRegistry");
  const hash = ethers.sha256(ethers.toUtf8Bytes("synthetic-evidence-one"));
  const otherHash = ethers.sha256(ethers.toUtf8Bytes("synthetic-evidence-two"));
  return { registry, issuer, other, hash, otherHash };
}

describe("CreditRegistry", () => {
  it("mints a credit for new evidence", async () => {
    const { registry, issuer, hash } = await loadFixture(deploy);

    await expect(registry.mint(hash, "akofia://evidence"))
      .to.emit(registry, "CreditMinted")
      .withArgs(1n, hash, issuer.address, "akofia://evidence");

    expect(await registry.creditIdForEvidence(hash)).to.equal(1n);
    const credit = await registry.getCredit(1);
    expect(credit.evidenceHash).to.equal(hash);
    expect(credit.issuer).to.equal(issuer.address);
    expect(credit.status).to.equal(Status.Issued);
    expect(credit.uri).to.equal("akofia://evidence");
  });

  it("reverts the second mint of the same hash", async () => {
    const { registry, hash } = await loadFixture(deploy);
    await registry.mint(hash, "akofia://evidence");

    await expect(registry.mint(hash, "akofia://evidence"))
      .to.be.revertedWithCustomError(registry, "EVIDENCE_ALREADY_USED")
      .withArgs(hash, 1n);

    await expect(registry.mint(hash, "a-different-uri"))
      .to.be.revertedWithCustomError(registry, "EVIDENCE_ALREADY_USED")
      .withArgs(hash, 1n);

    expect(await registry.nextId()).to.equal(1n);
  });

  it("retires an issued credit and refuses a second retire", async () => {
    const { registry, issuer, other, hash } = await loadFixture(deploy);
    await registry.mint(hash, "akofia://evidence");

    const otherRegistry = registry.connect(other) as typeof registry;
    await expect(otherRegistry.retire(1))
      .to.be.revertedWithCustomError(registry, "NOT_ISSUER")
      .withArgs(1n, other.address);

    await expect(registry.retire(1)).to.emit(registry, "CreditRetired").withArgs(1n, issuer.address);
    expect((await registry.getCredit(1)).status).to.equal(Status.Retired);

    await expect(registry.retire(1)).to.be.revertedWithCustomError(registry, "CREDIT_NOT_ISSUED");
  });

  it("returns zero for an unknown evidence hash", async () => {
    const { registry, otherHash } = await loadFixture(deploy);
    expect(await registry.creditIdForEvidence(otherHash)).to.equal(0n);
    expect((await registry.getCredit(99)).status).to.equal(Status.None);
    expect((await registry.getCredit(99)).issuer).to.equal(ethers.ZeroAddress);
  });

  it("marks an issued credit contested", async () => {
    const { registry, other, hash } = await loadFixture(deploy);
    await registry.mint(hash, "akofia://evidence");

    const challenger = registry.connect(other) as typeof registry;
    await expect(challenger.contest(1, "plots overlap a second project"))
      .to.emit(registry, "CreditContested")
      .withArgs(1n, other.address, "plots overlap a second project");

    expect((await registry.getCredit(1)).status).to.equal(Status.Contested);
    await expect(registry.retire(1)).to.be.revertedWithCustomError(registry, "CREDIT_NOT_ISSUED");
  });

  it("still mints a different fingerprint", async () => {
    const { registry, hash, otherHash } = await loadFixture(deploy);
    await registry.mint(hash, "one");
    await registry.mint(otherHash, "two");
    expect(await registry.creditIdForEvidence(otherHash)).to.equal(2n);
    expect((await registry.getCredit(2)).status).to.equal(Status.Issued);
  });

  it("rejects an empty fingerprint or an empty uri", async () => {
    const { registry, hash } = await loadFixture(deploy);
    await expect(registry.mint(ethers.ZeroHash, "uri")).to.be.revertedWithCustomError(registry, "EMPTY_EVIDENCE");
    await expect(registry.mint(hash, "")).to.be.revertedWithCustomError(registry, "EMPTY_URI");
  });
});
