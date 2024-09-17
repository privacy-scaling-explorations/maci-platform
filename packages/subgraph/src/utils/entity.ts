/* eslint-disable no-underscore-dangle */
import { BigInt as GraphBN, Bytes, ethereum, Address } from "@graphprotocol/graph-ts";

import { Account, MACI, Recipient, Registry, RegistryManager, User } from "../../generated/schema";
import { Registry as RegistryTemplate } from "../../generated/templates";

export const createOrLoadMACI = (event: ethereum.Event, stateTreeDepth: GraphBN = GraphBN.fromI32(10)): MACI => {
  let maci = MACI.load(event.address);

  if (!maci) {
    maci = new MACI(event.address);
    maci.stateTreeDepth = stateTreeDepth;
    maci.updatedAt = event.block.timestamp;
    maci.numPoll = GraphBN.zero();
    maci.numSignUps = GraphBN.zero();
    maci.latestPoll = Bytes.empty();
    maci.save();
  }

  return maci;
};

export const createOrLoadRegistryManager = (event: ethereum.Event): RegistryManager => {
  let registryManager = RegistryManager.load(event.address);

  if (!registryManager) {
    registryManager = new RegistryManager(event.address);
    registryManager.save();
  }

  return registryManager;
};

export const createOrLoadUser = (publicKeyX: GraphBN, publicKeyY: GraphBN, event: ethereum.Event): User => {
  const publicKey = `${publicKeyX.toString()} ${publicKeyY.toString()}`;
  let user = User.load(publicKey);

  if (!user) {
    user = new User(publicKey);
    user.createdAt = event.block.timestamp;
    user.save();
  }

  return user;
};

export const createOrLoadAccount = (
  stateIndex: GraphBN,
  event: ethereum.Event,
  owner: string,
  voiceCreditBalance: GraphBN = GraphBN.zero(),
): Account => {
  const id = stateIndex.toString();
  let account = Account.load(id);

  if (!account) {
    account = new Account(id);
    account.owner = owner;
    account.voiceCreditBalance = voiceCreditBalance;
    account.createdAt = event.block.timestamp;
    account.save();
  }

  return account;
};

export const createOrLoadRegistry = (id: Address): Registry => {
  let registry = Registry.load(id);

  if (!registry) {
    registry = new Registry(id);
    registry.save();
    RegistryTemplate.create(id);
  }

  return registry;
};

export const createOrLoadRecipient = (
  id: Bytes,
  metadataUrl: string,
  index: GraphBN,
  payout: Address,
  registry: Address,
): Recipient => {
  createOrLoadRegistry(registry);
  let recipient = Recipient.load(id);

  if (!recipient) {
    recipient = new Recipient(id);
    recipient.metadataUrl = metadataUrl;
    recipient.index = index;
    recipient.payout = payout;
    recipient.registry = registry;
    recipient.initialized = false;
    recipient.deleted = false;
    recipient.save();
  }

  return recipient;
};
