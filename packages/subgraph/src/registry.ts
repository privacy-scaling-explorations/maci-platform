import { Recipient } from "../generated/schema";
import { RecipientAdded, RecipientChanged, RecipientRemoved } from "../generated/templates/Registry/Registry";

import { createOrLoadRecipient, createOrLoadRegistry } from "./utils/entity";

export function handleAddRecipient(event: RecipientAdded): void {
  createOrLoadRegistry(event.address);
  const recipient = createOrLoadRecipient(
    event.params.id,
    event.params.metadataUrl,
    event.params.index,
    event.params.payout,
    event.address,
  );

  // we want to ensure that the index is the recipient index in the registry
  recipient.index = event.params.index;
  recipient.initialized = true;
  recipient.save();
}

export function handleChangeRecipient(event: RecipientChanged): void {
  const recipient = Recipient.load(event.params.id);

  if (!recipient) {
    return;
  }

  const registry = createOrLoadRegistry(event.address);
  const recipientsLoader = registry.recipients;
  const recipients = recipientsLoader.load();

  // eslint-disable-next-line @typescript-eslint/prefer-for-of, no-plusplus
  for (let i = 0; i < recipients.length; i++) {
    // eslint-disable-next-line eqeqeq
    if (recipients[i].index == event.params.index && !recipients[i].deleted) {
      recipients[i].deleted = true;
      recipients[i].save();
      break;
    }
  }

  // we want to ensure that the index is the recipient index in the registry
  recipient.index = event.params.index;
  recipient.initialized = true;
  recipient.deleted = false;
  recipient.save();
}

export function handleRemoveRecipient(event: RecipientRemoved): void {
  const recipient = Recipient.load(event.params.id);

  if (!recipient) {
    return;
  }

  recipient.deleted = true;
  recipient.save();
}
