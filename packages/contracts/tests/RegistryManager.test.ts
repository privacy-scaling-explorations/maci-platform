import { expect } from "chai";
import { encodeBytes32String, Signer, ZeroAddress } from "ethers";
import { getSigners, deployContract } from "maci-contracts";

import { ERegistryManagerRequestStatus, ERegistryManagerRequestType } from "../ts";
import { RegistryManager, MockRegistry } from "../typechain-types";

describe("RegistryManager", () => {
  let registryManager: RegistryManager;
  let mockRegistry: MockRegistry;
  let owner: Signer;
  let user: Signer;

  let ownerAddress: string;
  let userAddress: string;

  const attestation = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const metadataUrl = encodeBytes32String("url");
  const maxRecipients = 5;

  before(async () => {
    [owner, user] = await getSigners();
    [ownerAddress, userAddress] = await Promise.all([owner.getAddress(), user.getAddress()]);

    registryManager = await deployContract("RegistryManager", owner, true);

    mockRegistry = await deployContract(
      "MockRegistry",
      owner,
      true,
      maxRecipients,
      metadataUrl,
      await registryManager.getAddress(),
    );
  });

  it("should not allow user to send invalid requests to the registry", async () => {
    await expect(
      registryManager.connect(user).process({
        index: 0,
        registry: ZeroAddress,
        requestType: ERegistryManagerRequestType.Add,
        status: ERegistryManagerRequestStatus.Pending,
        recipient: {
          id: attestation,
          recipient: ownerAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");

    await expect(
      registryManager.connect(user).process({
        index: 0,
        registry: await mockRegistry.getAddress(),
        requestType: ERegistryManagerRequestType.Add,
        status: ERegistryManagerRequestStatus.Pending,
        recipient: {
          id: attestation,
          recipient: ZeroAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");

    await expect(
      registryManager.connect(user).process({
        index: 1,
        registry: await mockRegistry.getAddress(),
        requestType: ERegistryManagerRequestType.Change,
        status: ERegistryManagerRequestStatus.Pending,
        recipient: {
          id: attestation,
          recipient: userAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");

    await expect(
      registryManager.connect(user).process({
        index: 1,
        registry: await mockRegistry.getAddress(),
        requestType: ERegistryManagerRequestType.Remove,
        status: ERegistryManagerRequestStatus.Pending,
        recipient: {
          id: attestation,
          recipient: userAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");

    const unknownRegistry = await deployContract("MockRegistry", owner, true, maxRecipients, metadataUrl, userAddress);

    await expect(
      registryManager.connect(user).process({
        index: 0,
        registry: await unknownRegistry.getAddress(),
        requestType: ERegistryManagerRequestType.Add,
        status: ERegistryManagerRequestStatus.Pending,
        recipient: {
          id: attestation,
          recipient: userAddress,
          metadataUrl,
        },
      }),
    ).to.be.revertedWithCustomError(registryManager, "ValidationError");

    expect(await registryManager.requestCount()).to.equal(0);
  });

  it("should allow user to send requests to the registry", async () => {
    const addRequest = {
      index: 0,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Add,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      },
    };

    await expect(registryManager.connect(user).process(addRequest))
      .to.emit(registryManager, "RequestSent")
      .withArgs(
        addRequest.registry,
        addRequest.requestType,
        addRequest.recipient.id,
        addRequest.index,
        addRequest.index,
        addRequest.recipient.recipient,
        addRequest.recipient.metadataUrl,
      );

    expect(await registryManager.requestCount()).to.equal(1);
  });

  it("should not allow non-owner to approve requests to the registry", async () => {
    await expect(registryManager.connect(user).approve(0)).to.be.revertedWithCustomError(
      registryManager,
      "OwnableUnauthorizedAccount",
    );
  });

  it("should not allow non-owner to reject requests to the registry", async () => {
    await expect(registryManager.connect(user).reject(0)).to.be.revertedWithCustomError(
      registryManager,
      "OwnableUnauthorizedAccount",
    );
  });

  it("should not allow to approve requests to the registry with invalid index", async () => {
    await expect(registryManager.connect(owner).approve(9000)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );
  });

  it("should not allow to reject requests to the registry with invalid index", async () => {
    await expect(registryManager.connect(owner).reject(9000)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );
  });

  it("should allow owner to approve requests to the registry", async () => {
    const addRequest = await registryManager.getRequest(0);

    expect(addRequest.status).to.equal(ERegistryManagerRequestStatus.Pending);

    await expect(registryManager.connect(owner).approve(0))
      .to.emit(registryManager, "RequestApproved")
      .withArgs(
        addRequest.registry,
        addRequest.requestType,
        addRequest.recipient.id,
        addRequest.index,
        addRequest.index,
        addRequest.recipient.recipient,
        addRequest.recipient.metadataUrl,
      );

    const changeRequest = {
      index: 0,
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

  it("should not allow to approve requests to the registry twice", async () => {
    await expect(registryManager.connect(owner).approve(0)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );

    await expect(registryManager.connect(owner).approve(1)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );
  });

  it("should allow owner to reject requests to the registry", async () => {
    const addRequest = {
      index: 0,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Add,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: ownerAddress,
        metadataUrl,
      },
    };

    const changeRequest = {
      index: 0,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Change,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: userAddress,
        metadataUrl,
      },
    };

    await expect(registryManager.connect(user).process(addRequest))
      .to.emit(registryManager, "RequestSent")
      .withArgs(
        addRequest.registry,
        addRequest.requestType,
        addRequest.recipient.id,
        addRequest.index,
        2,
        addRequest.recipient.recipient,
        addRequest.recipient.metadataUrl,
      );

    await expect(registryManager.connect(user).process(changeRequest))
      .to.emit(registryManager, "RequestSent")
      .withArgs(
        changeRequest.registry,
        changeRequest.requestType,
        changeRequest.recipient.id,
        changeRequest.index,
        3,
        changeRequest.recipient.recipient,
        changeRequest.recipient.metadataUrl,
      );

    await expect(registryManager.connect(owner).reject(2))
      .to.emit(registryManager, "RequestRejected")
      .withArgs(
        addRequest.registry,
        addRequest.requestType,
        addRequest.recipient.id,
        addRequest.index,
        2,
        addRequest.recipient.recipient,
        addRequest.recipient.metadataUrl,
      );

    await expect(registryManager.connect(owner).reject(3))
      .to.emit(registryManager, "RequestRejected")
      .withArgs(
        changeRequest.registry,
        changeRequest.requestType,
        changeRequest.recipient.id,
        changeRequest.index,
        3,
        changeRequest.recipient.recipient,
        changeRequest.recipient.metadataUrl,
      );

    const [updatedAddRequest, updatedChangeRequest] = await Promise.all([
      registryManager.getRequest(2),
      registryManager.getRequest(3),
    ]);

    expect(updatedAddRequest.status).to.equal(ERegistryManagerRequestStatus.Rejected);
    expect(updatedChangeRequest.status).to.equal(ERegistryManagerRequestStatus.Rejected);
  });

  it("should not allow to reject requests to the registry twice", async () => {
    await expect(registryManager.connect(owner).reject(2)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );

    await expect(registryManager.connect(owner).reject(3)).to.be.revertedWithCustomError(
      registryManager,
      "OperationError",
    );
  });

  it("should allow to approve remove request to the registry", async () => {
    const removeRequest = {
      index: 0,
      registry: await mockRegistry.getAddress(),
      requestType: ERegistryManagerRequestType.Remove,
      status: ERegistryManagerRequestStatus.Pending,
      recipient: {
        id: attestation,
        recipient: userAddress,
        metadataUrl,
      },
    };

    await expect(registryManager.connect(user).process(removeRequest))
      .to.emit(registryManager, "RequestSent")
      .withArgs(
        removeRequest.registry,
        removeRequest.requestType,
        removeRequest.recipient.id,
        removeRequest.index,
        4,
        removeRequest.recipient.recipient,
        removeRequest.recipient.metadataUrl,
      );

    const count = await registryManager.requestCount();

    await expect(registryManager.connect(owner).approve(count - 1n))
      .to.emit(registryManager, "RequestApproved")
      .withArgs(
        removeRequest.registry,
        removeRequest.requestType,
        removeRequest.recipient.id,
        removeRequest.index,
        count - 1n,
        removeRequest.recipient.recipient,
        removeRequest.recipient.metadataUrl,
      );

    const [updatedRemoveRequest, recipientCount] = await Promise.all([
      registryManager.getRequest(count - 1n),
      mockRegistry.recipientCount(),
    ]);

    expect(updatedRemoveRequest.status).to.equal(ERegistryManagerRequestStatus.Approved);
    expect(recipientCount).to.equal(0);
  });
});
