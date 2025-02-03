import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, test } from "matchstick-as";

import { Recipient, Registry } from "../../generated/schema";
import { handleAddRecipient, handleChangeRecipient, handleRemoveRecipient } from "../../src/registry";
import { DEFAULT_PAYOUT_ADDRESS, DEFAULT_REGISTRY_ADDRESS } from "../common";

import { createRecipientAddEvent, createRecipientChangeEvent, createRecipientRemoveEvent } from "./utils";

export { handleAddRecipient, handleChangeRecipient, handleRemoveRecipient };

describe("Registry", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle adding recipient properly", () => {
    const event = createRecipientAddEvent(
      DEFAULT_REGISTRY_ADDRESS,
      Bytes.fromUTF8("id"),
      BigInt.fromI32(0),
      DEFAULT_PAYOUT_ADDRESS,
      "url",
    );

    handleAddRecipient(event);

    const registry = Registry.load(event.address)!;
    const recipient = Recipient.load(event.params.id)!;

    assert.fieldEquals("Registry", registry.id.toHex(), "id", DEFAULT_REGISTRY_ADDRESS.toHex());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "index", event.params.index.toString());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "deleted", "false");
    assert.fieldEquals("Recipient", recipient.id.toHex(), "initialized", "true");
    assert.fieldEquals("Recipient", recipient.id.toHex(), "metadataUrl", event.params.metadataUrl);
    assert.fieldEquals("Recipient", recipient.id.toHex(), "payout", event.params.payout.toHex());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "registry", DEFAULT_REGISTRY_ADDRESS.toHex());
  });

  test("should handle changing recipient properly", () => {
    const addEvent1 = createRecipientAddEvent(
      DEFAULT_REGISTRY_ADDRESS,
      Bytes.fromUTF8("id1"),
      BigInt.fromI32(0),
      DEFAULT_PAYOUT_ADDRESS,
      "url1",
    );

    handleAddRecipient(addEvent1);

    const addEvent2 = createRecipientAddEvent(
      DEFAULT_REGISTRY_ADDRESS,
      Bytes.fromUTF8("id2"),
      BigInt.fromI32(1),
      DEFAULT_REGISTRY_ADDRESS,
      "url2",
    );

    handleAddRecipient(addEvent2);

    const changeEvent = createRecipientChangeEvent(
      DEFAULT_REGISTRY_ADDRESS,
      Bytes.fromUTF8("id2"),
      BigInt.fromI32(0),
      DEFAULT_REGISTRY_ADDRESS,
      "url2",
    );

    handleChangeRecipient(changeEvent);

    const registry = Registry.load(changeEvent.address)!;
    const oldRecipient = Recipient.load(addEvent1.params.id)!;
    const recipient = Recipient.load(changeEvent.params.id)!;

    assert.fieldEquals("Registry", registry.id.toHex(), "id", DEFAULT_REGISTRY_ADDRESS.toHex());
    assert.fieldEquals("Recipient", oldRecipient.id.toHex(), "index", changeEvent.params.index.toString());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "index", changeEvent.params.index.toString());
    assert.fieldEquals("Recipient", oldRecipient.id.toHex(), "deleted", "true");
    assert.fieldEquals("Recipient", recipient.id.toHex(), "deleted", "false");
    assert.fieldEquals("Recipient", recipient.id.toHex(), "initialized", "true");
    assert.fieldEquals("Recipient", recipient.id.toHex(), "metadataUrl", changeEvent.params.metadataUrl);
    assert.fieldEquals("Recipient", recipient.id.toHex(), "payout", changeEvent.params.newPayout.toHex());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "registry", DEFAULT_REGISTRY_ADDRESS.toHex());
  });

  test("should handle removing recipient properly", () => {
    handleAddRecipient(
      createRecipientAddEvent(
        DEFAULT_REGISTRY_ADDRESS,
        Bytes.fromUTF8("id"),
        BigInt.fromI32(0),
        DEFAULT_PAYOUT_ADDRESS,
        "url",
      ),
    );

    const event = createRecipientRemoveEvent(
      DEFAULT_REGISTRY_ADDRESS,
      Bytes.fromUTF8("id"),
      BigInt.fromI32(0),
      DEFAULT_REGISTRY_ADDRESS,
    );

    handleRemoveRecipient(event);

    const registry = Registry.load(event.address)!;
    const recipient = Recipient.load(event.params.id)!;

    assert.fieldEquals("Registry", registry.id.toHex(), "id", DEFAULT_REGISTRY_ADDRESS.toHex());
    assert.fieldEquals("Recipient", recipient.id.toHex(), "deleted", "true");
  });
});
