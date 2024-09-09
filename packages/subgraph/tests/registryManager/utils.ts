import { Address, BigInt as GraphBN, Bytes, ethereum } from "@graphprotocol/graph-ts";
// eslint-disable-next-line import/no-extraneous-dependencies
import { newMockEvent } from "matchstick-as";

export function createRequestEvent<T>(
  address: Address,
  registry: Address,
  requestType: GraphBN,
  recipient: Bytes,
  index: GraphBN,
  payout: Address,
  metadataUrl: Bytes,
): T {
  const event = newMockEvent();

  event.parameters.push(new ethereum.EventParam("registry", ethereum.Value.fromAddress(registry)));
  event.parameters.push(new ethereum.EventParam("requestType", ethereum.Value.fromUnsignedBigInt(requestType)));
  event.parameters.push(new ethereum.EventParam("recipient", ethereum.Value.fromBytes(recipient)));
  event.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)));
  event.parameters.push(new ethereum.EventParam("payout", ethereum.Value.fromAddress(payout)));
  event.parameters.push(new ethereum.EventParam("metadataUrl", ethereum.Value.fromBytes(metadataUrl)));

  event.address = address;

  return changetype<T>(event);
}
