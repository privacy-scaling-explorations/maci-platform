import { Address, BigInt as GraphBN, ethereum } from "@graphprotocol/graph-ts";
// eslint-disable-next-line import/no-extraneous-dependencies
import { newMockEvent } from "matchstick-as";

import { Claimed, Deposited, ResultAdded } from "../../generated/templates/Tally/Tally";

export function createDepositedEvent(tally: Address, sender: Address, amount: GraphBN): Deposited {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.address = tally;

  return changetype<Deposited>(event);
}

export function createClaimedEvent(tally: Address, index: GraphBN, recipient: Address, amount: GraphBN): Claimed {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient)));
  event.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));

  event.address = tally;

  return changetype<Claimed>(event);
}

export function createResultAddedEvent(tally: Address, index: GraphBN, result: GraphBN): ResultAdded {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("result", ethereum.Value.fromUnsignedBigInt(result)));

  event.address = tally;

  return changetype<ResultAdded>(event);
}
