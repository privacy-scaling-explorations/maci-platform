import {
  Claimed as ClaimedEvent,
  Deposited as DepositedEvent,
  ResultAdded as ResultAddedEvent,
} from "../generated/templates/Tally/Tally";

import { createOrLoadClaim, createOrLoadDeposit, createOrLoadTallyResult } from "./utils/entity";

export function handleAddResult(event: ResultAddedEvent): void {
  createOrLoadTallyResult(event.params.index, event.params.result, event.address);
}

export function handleAddClaim(event: ClaimedEvent): void {
  createOrLoadClaim(event.params.index, event.params.receiver, event.params.amount, event.address);
}

export function handleAddDeposit(event: DepositedEvent): void {
  createOrLoadDeposit(event.params.sender, event.params.amount, event.address);
}
