import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, describe, test } from "matchstick-as";

import { RequestApproved, RequestRejected, RequestSent } from "../../generated/RegistryManager/RegistryManager";
import { RegistryManager, Request } from "../../generated/schema";
import { handleRequestApproved, handleRequestRejected, handleRequestSent } from "../../src/registryManager";
import { RequestTypes } from "../../src/utils/constants";
import {
  DEFAULT_PAYOUT_ADDRESS,
  DEFAULT_REGISTRY_ADDRESS,
  DEFAULT_REGISTRY_MANAGER_ADDRESS,
  mockRegistryManager,
} from "../common";

import { createRequestEvent } from "./utils";

export { handleRequestApproved, handleRequestRejected, handleRequestSent };

describe("RegistryManager", () => {
  beforeEach(() => {
    mockRegistryManager();
  });

  afterEach(() => {
    clearStore();
  });

  test("should send and approve requests properly", () => {
    [RequestTypes.Add, RequestTypes.Change, RequestTypes.Remove].forEach((requestType) => {
      const sentEvent = createRequestEvent<RequestSent>(
        DEFAULT_REGISTRY_MANAGER_ADDRESS,
        DEFAULT_REGISTRY_ADDRESS,
        BigInt.fromI32(requestType),
        Bytes.fromUTF8("id"),
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        DEFAULT_PAYOUT_ADDRESS,
        "metadataUrl",
      );

      handleRequestSent(sentEvent);

      const registryManager = RegistryManager.load(sentEvent.address)!;
      const request = Request.load("0")!;

      assert.fieldEquals("RegistryManager", registryManager.id.toHex(), "id", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
      assert.fieldEquals("Request", request.id, "requestType", ["Add", "Change", "Remove"][requestType].toString());
      assert.fieldEquals("Request", request.id, "index", sentEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "recipientIndex", sentEvent.params.recipientIndex.toString());
      assert.fieldEquals("Request", request.id, "status", "Pending");
      assert.fieldEquals("Request", request.id, "recipient", sentEvent.params.recipient.toHex());
      assert.fieldEquals("Request", request.id, "registry", sentEvent.params.registry.toHex());
      assert.fieldEquals("Request", request.id, "registryManager", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());

      const approveEvent = createRequestEvent<RequestApproved>(
        DEFAULT_REGISTRY_MANAGER_ADDRESS,
        DEFAULT_REGISTRY_ADDRESS,
        BigInt.fromI32(requestType),
        Bytes.fromUTF8("id"),
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        DEFAULT_PAYOUT_ADDRESS,
        "metadataUrl",
      );

      handleRequestApproved(approveEvent);

      assert.fieldEquals("RegistryManager", registryManager.id.toHex(), "id", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
      assert.fieldEquals("Request", request.id, "requestType", ["Add", "Change", "Remove"][requestType].toString());
      assert.fieldEquals("Request", request.id, "index", approveEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "recipientIndex", approveEvent.params.recipientIndex.toString());
      assert.fieldEquals("Request", request.id, "status", "Approved");
      assert.fieldEquals("Request", request.id, "recipient", approveEvent.params.recipient.toHex());
      assert.fieldEquals("Request", request.id, "registry", approveEvent.params.registry.toHex());
      assert.fieldEquals("Request", request.id, "registryManager", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
    });
  });

  test("should send and reject requests properly", () => {
    [RequestTypes.Add, RequestTypes.Change, RequestTypes.Remove].forEach((requestType) => {
      const sentEvent = createRequestEvent<RequestSent>(
        DEFAULT_REGISTRY_MANAGER_ADDRESS,
        DEFAULT_REGISTRY_ADDRESS,
        BigInt.fromI32(requestType),
        Bytes.fromUTF8("id"),
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        DEFAULT_PAYOUT_ADDRESS,
        "metadataUrl",
      );

      handleRequestSent(sentEvent);

      const registryManager = RegistryManager.load(sentEvent.address)!;
      const request = Request.load("0")!;

      assert.fieldEquals("RegistryManager", registryManager.id.toHex(), "id", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
      assert.fieldEquals("Request", request.id, "requestType", ["Add", "Change", "Remove"][requestType].toString());
      assert.fieldEquals("Request", request.id, "index", sentEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "recipientIndex", sentEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "status", "Pending");
      assert.fieldEquals("Request", request.id, "recipient", sentEvent.params.recipient.toHex());
      assert.fieldEquals("Request", request.id, "registry", sentEvent.params.registry.toHex());
      assert.fieldEquals("Request", request.id, "registryManager", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());

      const rejectEvent = createRequestEvent<RequestRejected>(
        DEFAULT_REGISTRY_MANAGER_ADDRESS,
        DEFAULT_REGISTRY_ADDRESS,
        BigInt.fromI32(requestType),
        Bytes.fromUTF8("id"),
        BigInt.fromI32(0),
        BigInt.fromI32(0),
        DEFAULT_PAYOUT_ADDRESS,
        "metadataUrl",
      );

      handleRequestRejected(rejectEvent);

      assert.fieldEquals("RegistryManager", registryManager.id.toHex(), "id", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
      assert.fieldEquals("Request", request.id, "requestType", ["Add", "Change", "Remove"][requestType].toString());
      assert.fieldEquals("Request", request.id, "index", rejectEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "recipientIndex", rejectEvent.params.index.toString());
      assert.fieldEquals("Request", request.id, "status", "Rejected");
      assert.fieldEquals("Request", request.id, "recipient", rejectEvent.params.recipient.toHex());
      assert.fieldEquals("Request", request.id, "registry", rejectEvent.params.registry.toHex());
      assert.fieldEquals("Request", request.id, "registryManager", DEFAULT_REGISTRY_MANAGER_ADDRESS.toHex());
    });
  });
});
