import {
  RequestApproved,
  RequestRejected,
  RequestSent,
  RegistryManager as RegistryManagerContract,
} from "../generated/RegistryManager/RegistryManager";
import { Request } from "../generated/schema";

import { ONE_BIG_INT, RequestTypes } from "./utils/constants";
import { createOrLoadRecipient, createOrLoadRegistryManager } from "./utils/entity";

export function handleRequestSent(event: RequestSent): void {
  const registryManager = createOrLoadRegistryManager(event);
  const contract = RegistryManagerContract.bind(event.address);
  const id = contract.requestCount().minus(ONE_BIG_INT);
  const request = new Request(id.toString());

  switch (event.params.requestType) {
    case RequestTypes.Add: {
      request.requestType = "Add";
      break;
    }
    case RequestTypes.Change: {
      request.requestType = "Change";
      break;
    }
    case RequestTypes.Remove: {
      request.requestType = "Remove";
      break;
    }
    default:
      break;
  }

  const recipient = createOrLoadRecipient(
    event.params.recipient,
    event.params.metadataUrl,
    event.params.index,
    event.params.payout,
    event.params.registry,
  );

  request.status = "Pending";
  request.index = event.params.index;
  request.recipientIndex = event.params.recipientIndex;
  request.recipient = recipient.id;
  request.registryManager = registryManager.id;
  request.registry = event.params.registry;

  request.save();
}

export function handleRequestApproved(event: RequestApproved): void {
  const request = Request.load(event.params.index.toString());

  if (!request) {
    return;
  }

  request.status = "Approved";
  request.save();
}

export function handleRequestRejected(event: RequestRejected): void {
  const request = Request.load(event.params.index.toString());

  if (!request) {
    return;
  }

  request.status = "Rejected";
  request.save();
}
