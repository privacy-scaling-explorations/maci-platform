import { BigInt } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, test } from "matchstick-as";

import { Claim, Deposit, TallyResult } from "../../generated/schema";
import { handleAddClaim, handleAddDeposit, handleAddResult } from "../../src/tally";
import { DEFAULT_PAYOUT_ADDRESS, DEFAULT_TALLY_ADDRESS } from "../common";

import { createClaimedEvent, createDepositedEvent, createResultAddedEvent } from "./utils";

export { handleAddClaim, handleAddDeposit, handleAddResult };

describe("Tally", () => {
  afterEach(() => {
    clearStore();
  });

  test("should handle claims properly", () => {
    const event = createClaimedEvent(
      DEFAULT_TALLY_ADDRESS,
      BigInt.fromI32(0),
      DEFAULT_PAYOUT_ADDRESS,
      BigInt.fromI32(100),
    );

    handleAddClaim(event);

    const claim = Claim.load("0")!;

    assert.fieldEquals("Claim", claim.id, "amount", event.params.amount.toString());
    assert.fieldEquals("Claim", claim.id, "recipient", event.params.receiver.toHex());
  });

  test("should handle deposits properly", () => {
    const event = createDepositedEvent(DEFAULT_TALLY_ADDRESS, DEFAULT_PAYOUT_ADDRESS, BigInt.fromI32(100));

    handleAddDeposit(event);

    const deposit = Deposit.load(event.params.sender)!;

    assert.fieldEquals("Deposit", deposit.id.toHex(), "amount", event.params.amount.toString());
  });

  test("should handle add results properly", () => {
    const event = createResultAddedEvent(DEFAULT_TALLY_ADDRESS, BigInt.fromI32(0), BigInt.fromI32(100));

    handleAddResult(event);

    const tallyResult = TallyResult.load(event.params.index.toString())!;

    assert.fieldEquals("TallyResult", tallyResult.id, "result", event.params.result.toString());
  });
});
