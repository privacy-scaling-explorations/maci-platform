import { expect } from "chai";
import { Signer, ZeroAddress } from "ethers";
import { getSigners, deployContract } from "maci-contracts";

import { EASRegistry, MockEAS, ICommon__factory as ICommonFactory } from "../typechain-types";

describe("EASRegistry", () => {
  let registry: EASRegistry;
  let mockEAS: MockEAS;
  let owner: Signer;
  let user: Signer;

  let ownerAddress: string;
  let userAddress: string;

  const maxRecipients = 5;

  const schema = "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b";
  const attestation = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const newAttestation = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const metadataUrl = "url";

  before(async () => {
    [owner, user] = await getSigners();
    [ownerAddress, userAddress] = await Promise.all([owner.getAddress(), user.getAddress()]);

    mockEAS = await deployContract("MockEAS", owner, true, ownerAddress, schema, userAddress);

    await expect(
      deployContract("EASRegistry", owner, true, maxRecipients, metadataUrl, ZeroAddress, ownerAddress),
    ).to.be.revertedWithCustomError({ interface: ICommonFactory.createInterface() }, "InvalidAddress");

    registry = await deployContract(
      "EASRegistry",
      owner,
      true,
      maxRecipients,
      metadataUrl,
      await mockEAS.getAddress(),
      ownerAddress,
    );
  });

  it("should allow the owner to add a recipient", async () => {
    expect(
      await registry.addRecipient({
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      }),
    )
      .to.emit(registry, "RecipientAdded")
      .withArgs(0, attestation, metadataUrl, ownerAddress);
  });

  it("should fail to add the recipient if recipient address is invalid", async () => {
    await expect(
      registry.connect(owner).addRecipient({
        id: attestation,
        recipient: ZeroAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "InvalidInput");
  });

  it("should allow the owner to add multiple projects", async () => {
    const tx = await registry.addRecipients([
      {
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      },
      {
        id: attestation,
        recipient: userAddress,
        metadataUrl,
      },
      {
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      },
    ]);

    await Promise.all([
      expect(tx).to.emit(registry, "RecipientAdded").withArgs(1, attestation, metadataUrl, ownerAddress),
      expect(tx).to.emit(registry, "RecipientAdded").withArgs(2, attestation, metadataUrl, userAddress),
      expect(tx).to.emit(registry, "RecipientAdded").withArgs(3, attestation, metadataUrl, ownerAddress),
    ]);
  });

  it("should throw if the caller is not the owner", async () => {
    await expect(
      registry.connect(user).addRecipient({
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");

    await expect(
      registry.connect(user).addRecipients([
        {
          id: attestation,
          recipient: ownerAddress,
          metadataUrl,
        },
      ]),
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");

    await expect(registry.connect(user).removeRecipient(0n)).to.be.revertedWithCustomError(
      registry,
      "OwnableUnauthorizedAccount",
    );

    await expect(
      registry.connect(user).changeRecipient(2n, {
        id: attestation,
        recipient: ZeroAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
  });

  it("should throw if the max projects is reached", async () => {
    // add one more
    await registry.addRecipient({
      id: attestation,
      recipient: ownerAddress,
      metadataUrl,
    });

    // next one will fail
    await expect(
      registry.addRecipient({
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "MaxRecipientsReached");
  });

  it("should allow a contract owner to change their recipient", async () => {
    expect(
      await registry.connect(owner).changeRecipient(2n, {
        id: newAttestation,
        metadataUrl,
        recipient: userAddress,
      }),
    )
      .to.emit(registry, "RecipientChanged")
      .withArgs(2n, attestation, metadataUrl, userAddress);

    expect(await registry.getRecipient(2n)).to.deep.equal([attestation, metadataUrl, userAddress]);
  });

  it("should fail to change the recipient if index is invalid", async () => {
    await expect(
      registry.connect(owner).changeRecipient(9000n, {
        id: attestation,
        recipient: ZeroAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "InvalidIndex");
  });

  it("should fail to change the recipient if recipient address is invalid", async () => {
    await expect(
      registry.connect(owner).changeRecipient(0n, {
        id: attestation,
        recipient: ZeroAddress,
        metadataUrl,
      }),
    ).to.be.revertedWithCustomError(registry, "InvalidInput");
  });

  it("should remove recipient properly", async () => {
    const count = await registry.recipientCount();

    expect(await registry.connect(owner).removeRecipient(2n))
      .to.emit(registry, "RecipientRemoved")
      .withArgs(2n, attestation, metadataUrl, ZeroAddress);

    expect(await registry.recipientCount()).to.equal(count - 1n);
    expect(await registry.getRecipient(2n)).to.deep.equal(["", "", ZeroAddress]);
  });

  it("should fail to remove the recipient if index is invalid", async () => {
    await expect(registry.connect(owner).removeRecipient(9000n)).to.be.revertedWithCustomError(
      registry,
      "InvalidIndex",
    );
  });

  it("should return the correct recipient data given an index", async () => {
    expect(await registry.getRecipient(0n)).to.deep.equal([attestation, metadataUrl, ownerAddress]);
  });

  it("should return the metadata url properly", async () => {
    expect(await registry.getRegistryMetadataUrl()).to.equal(metadataUrl);
  });

  it("should return the attestation properly", async () => {
    expect(await registry.getAttestation(attestation).then((data) => data.schema)).to.deep.equal(schema);
    expect(await registry.getAttestation(newAttestation).then((data) => data.schema)).to.deep.equal(schema);
  });
});
