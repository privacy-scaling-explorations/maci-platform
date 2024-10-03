/* eslint-disable no-underscore-dangle */

import { Poll, Vote, MACI } from "../generated/schema";
import {
  MergeMaciState as MergeMaciStateEvent,
  MergeMessageAq as MergeMessageAqEvent,
  MergeMessageAqSubRoots as MergeMessageAqSubRootsEvent,
  PollInit as PollInitEvent,
  PublishMessage as PublishMessageEvent,
  SetRegistry as SetRegistryEvent,
} from "../generated/templates/Poll/Poll";
import { Registry as RegistryContract } from "../generated/templates/Registry/Registry";

import { ONE_BIG_INT } from "./utils/constants";
import { createOrLoadRegistry } from "./utils/entity";

export function handleMergeMaciState(event: MergeMaciStateEvent): void {
  const poll = Poll.load(event.address);

  if (poll) {
    poll.stateRoot = event.params._stateRoot;
    poll.numSignups = event.params._numSignups;
    poll.updatedAt = event.block.timestamp;
    poll.save();

    const maci = MACI.load(poll.maci);

    if (maci) {
      maci.numSignUps = event.params._numSignups;
      maci.updatedAt = event.block.timestamp;
      maci.save();
    }
  }
}

export function handleMergeMessageAq(event: MergeMessageAqEvent): void {
  const poll = Poll.load(event.address);

  if (poll) {
    poll.messageRoot = event.params._messageRoot;
    poll.updatedAt = event.block.timestamp;
    poll.save();
  }
}

export function handleMergeMessageAqSubRoots(event: MergeMessageAqSubRootsEvent): void {
  const poll = Poll.load(event.address);

  if (poll) {
    poll.numSrQueueOps = event.params._numSrQueueOps;
    poll.updatedAt = event.block.timestamp;
    poll.save();
  }
}

export function handlePublishMessage(event: PublishMessageEvent): void {
  const vote = new Vote(event.transaction.hash.concatI32(event.logIndex.toI32()));
  vote.data = event.params._message.data;
  vote.poll = event.address;
  vote.timestamp = event.block.timestamp;
  vote.save();

  const poll = Poll.load(event.address);

  if (poll) {
    poll.numMessages = poll.numMessages.plus(ONE_BIG_INT);
    poll.updatedAt = event.block.timestamp;
    poll.save();
  }
}

export function handleSetRegistry(event: SetRegistryEvent): void {
  const poll = Poll.load(event.address);

  if (!poll) {
    return;
  }

  const contract = RegistryContract.bind(event.params.registry);

  const registry = createOrLoadRegistry(event.params.registry);
  registry.poll = poll.id;
  registry.metadataUrl = contract.getRegistryMetadataUrl();
  registry.save();

  poll.registry = event.params.registry;
  poll.updatedAt = event.block.timestamp;
  poll.save();
}

export function handleInitPoll(event: PollInitEvent): void {
  const poll = Poll.load(event.address);

  if (!poll) {
    return;
  }

  poll.initTime = event.block.timestamp;
  poll.save();
}
