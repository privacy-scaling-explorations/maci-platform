import { Address, BigInt as GraphBN, Bytes, ethereum } from "@graphprotocol/graph-ts";
// eslint-disable-next-line import/no-extraneous-dependencies
import { newMockEvent } from "matchstick-as";

import { RecipientAdded, RecipientChanged, RecipientRemoved } from "../../generated/templates/Registry/Registry";

export function createRecipientAddEvent(
  address: Address,
  recipient: Bytes,
  index: GraphBN,
  payout: Address,
  metadataUrl: string,
): RecipientAdded {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromBytes(recipient)));
  event.parameters.push(new ethereum.EventParam("metadataUrl", ethereum.Value.fromString(metadataUrl)));
  event.parameters.push(new ethereum.EventParam("payout", ethereum.Value.fromAddress(payout)));

  event.address = address;

  return changetype<RecipientAdded>(event);
}

export function createRecipientChangeEvent(
  address: Address,
  recipient: Bytes,
  index: GraphBN,
  newPayout: Address,
  metadataUrl: string,
): RecipientChanged {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromBytes(recipient)));
  event.parameters.push(new ethereum.EventParam("metadataUrl", ethereum.Value.fromString(metadataUrl)));
  event.parameters.push(new ethereum.EventParam("newPayout", ethereum.Value.fromAddress(newPayout)));

  event.address = address;

  return changetype<RecipientChanged>(event);
}

export function createRecipientRemoveEvent(
  address: Address,
  recipient: Bytes,
  index: GraphBN,
  newPayout: Address,
): RecipientRemoved {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("id", ethereum.Value.fromBytes(recipient)));
  event.parameters.push(new ethereum.EventParam("payout", ethereum.Value.fromAddress(newPayout)));

  event.address = address;

  return changetype<RecipientRemoved>(event);
}
