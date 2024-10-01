import { expect } from "chai";
import { encodeBytes32String, Signer, ZeroAddress } from "ethers";
import { getSigners, deployContract } from "maci-contracts";

import { ERegistryManagerRequestStatus, ERegistryManagerRequestType } from "../ts";
import { MockRegistry, EASRegistryManager, MockEAS, ICommon__factory as ICommonFactory } from "../typechain-types";

describe("EASRegistryManager", () => {
  let registryManager: EASRegistryManager;
  let mockEAS: MockEAS;
  let mockRegistry: MockRegistry;
  let owner: Signer;
  let user: Signer;

  let ownerAddress: string;
  let userAddress: string;

  const schema = "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b";
  const attestation = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const newAttestation = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const metadataUrl = encodeBytes32String("url");
  const maxRecipients = 5;

  before(async () => {
    [owner, user] = await getSigners();
    [ownerAddress, userAddress] = await Promise.all([owner.getAddress(), user.getAddress()]);

    mockEAS = await deployContract("MockEAS", owner, true, ownerAddress, schema, userAddress);

    registryManager = await deployContract("EASRegistryManager", owner, true, await mockEAS.getAddress());

    await expect(deployContract("EASRegistryManager", owner, true, ZeroAddress)).to.be.revertedWithCustomError(
      { interface: ICommonFactory.createInterface() },
      "InvalidAddress",
    );

    mockRegistry = await deployContract(
      "MockRegistry",
      owner,
      true,
      maxRecipients,
      metadataUrl,
      await registryManager.getAddress(),
    );

    await registryManager.connect(user).process({
      index: 0,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Add,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      },
    });
  });

  it("should not allow non-owner to approve requests to the registry", async () => {
    await expect(registryManager.connect(user).approve(0)).to.be.revertedWithCustomError(
      registryManager,
      "OwnableUnauthorizedAccount",
    );
  });

  it("should allow owner to approve requests to the registry", async () => {
    const requestIndex = 0;
    const addRequest = await registryManager.getRequest(requestIndex);

    expect(addRequest.status).to.equal(ERegistryManagerRequestStatus.Pending);

    await expect(registryManager.connect(owner).approve(requestIndex))
      .to.emit(registryManager, "RequestApproved")
      .withArgs(
        addRequest.registry,
        addRequest.requestType,
        addRequest.recipient.id,
        addRequest.index,
        requestIndex,
        addRequest.recipient.recipient,
        addRequest.recipient.metadataUrl,
      );

    const changeRequest = {
      index: requestIndex,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Change,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: userAddress,
        metadataUrl,
      },
    };

    await expect(registryManager.connect(user).process(changeRequest))
      .to.emit(registryManager, "RequestSent")
      .withArgs(
        changeRequest.registry,
        changeRequest.requestType,
        changeRequest.recipient.id,
        changeRequest.index,
        1,
        changeRequest.recipient.recipient,
        changeRequest.recipient.metadataUrl,
      );

    await expect(registryManager.connect(owner).approve(1))
      .to.emit(registryManager, "RequestApproved")
      .withArgs(
        changeRequest.registry,
        changeRequest.requestType,
        changeRequest.recipient.id,
        changeRequest.index,
        1,
        changeRequest.recipient.recipient,
        changeRequest.recipient.metadataUrl,
      );

    const [updatedAddRequest, updatedChangeRequest, recipient, recipientCount] = await Promise.all([
      registryManager.getRequest(0),
      registryManager.getRequest(1),
      mockRegistry.getRecipient(0),
      mockRegistry.recipientCount(),
    ]);

    expect(updatedAddRequest.status).to.equal(ERegistryManagerRequestStatus.Approved);
    expect(updatedChangeRequest.status).to.equal(ERegistryManagerRequestStatus.Approved);
    expect(recipient.id).to.equal(changeRequest.recipient.id);
    expect(recipient.recipient).to.equal(changeRequest.recipient.recipient);
    expect(recipient.metadataUrl).to.equal(changeRequest.recipient.metadataUrl);
    expect(recipientCount).to.equal(1);
  });

  it("should not allow to send requests to the registry with invalid request", async () => {
    await expect(
      registryManager.connect(owner).process({
        index: 1,
        registry: ZeroAddress,
        requestType: ERegistryManagerRequestType.Change,
        status: ERegistryManagerRequestStatus.Rejected,
        recipient: {
          id: newAttestation,
          recipient: ZeroAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");
  });

  it("should not allow to send requests to the registry with invalid attestation", async () => {
    await expect(
      registryManager.connect(owner).process({
        index: 0,
        registry: await mockRegistry.getAddress(),
        requestType: ERegistryManagerRequestType.Change,
        status: ERegistryManagerRequestStatus.Rejected,
        recipient: {
          id: newAttestation,
          recipient: ownerAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "NotYourAttestation");
  });
});
