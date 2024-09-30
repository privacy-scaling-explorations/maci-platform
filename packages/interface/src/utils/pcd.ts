/* eslint-disable */
import { booleanToBigInt, hexToBigInt, numberToBigInt, uuidToBigInt } from "@pcd/util";
import { ZKEdDSAEventTicketPCD, ZKEdDSAEventTicketPCDClaim } from "@pcd/zk-eddsa-event-ticket-pcd";
import { sha256 } from "js-sha256";

function convertStringArrayToBigIntArray(arr: string[]): bigint[] {
  return arr.map((x) => BigInt(x));
}

/**
 * Encoding of -1 in a Baby Jubjub field element (as p-1).
 */
export const BABY_JUB_NEGATIVE_ONE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495616",
);

/**
 * Max supported size of validEventIds field in ZKEdDSAEventTicketPCDArgs.
 */
export const VALID_EVENT_IDS_MAX_LEN = 20;

export function generateSnarkMessageHash(signal: string): bigint {
  // right shift to fit into a field element, which is 254 bits long
  // shift by 8 ensures we have a 253 bit element
  return BigInt(`0x${sha256(signal)}`) >> BigInt(8);
}

export const STATIC_TICKET_PCD_NULLIFIER = generateSnarkMessageHash("dummy-nullifier-for-eddsa-event-ticket-pcds");

export function snarkInputForValidEventIds(validEventIds?: string[]): string[] {
  if (validEventIds === undefined) {
    validEventIds = [];
  }
  if (validEventIds.length > VALID_EVENT_IDS_MAX_LEN) {
    throw new Error(
      `validEventIds for a ZKEdDSAEventTicketPCD can have up to 100 entries.  ${validEventIds.length} given.`,
    );
  }
  const snarkIds = new Array<string>(VALID_EVENT_IDS_MAX_LEN);
  let i = 0;
  for (const validId of validEventIds) {
    snarkIds[i] = uuidToBigInt(validId).toString();
    ++i;
  }
  for (; i < VALID_EVENT_IDS_MAX_LEN; ++i) {
    snarkIds[i] = BABY_JUB_NEGATIVE_ONE.toString();
  }
  return snarkIds;
}

export function publicSignalsFromClaim(claim: ZKEdDSAEventTicketPCDClaim): string[] {
  const t = claim.partialTicket;
  const ret: string[] = [];

  const negOne = BABY_JUB_NEGATIVE_ONE.toString();

  // Outputs appear in public signals first
  ret.push(t.ticketId === undefined ? negOne : uuidToBigInt(t.ticketId).toString());
  ret.push(t.eventId === undefined ? negOne : uuidToBigInt(t.eventId).toString());
  ret.push(t.productId === undefined ? negOne : uuidToBigInt(t.productId).toString());
  ret.push(t.timestampConsumed === undefined ? negOne : t.timestampConsumed.toString());
  ret.push(t.timestampSigned === undefined ? negOne : t.timestampSigned.toString());
  ret.push(t.attendeeSemaphoreId || negOne);
  ret.push(t.isConsumed === undefined ? negOne : booleanToBigInt(t.isConsumed).toString());
  ret.push(t.isRevoked === undefined ? negOne : booleanToBigInt(t.isRevoked).toString());
  ret.push(t.ticketCategory === undefined ? negOne : numberToBigInt(t.ticketCategory).toString());
  ret.push(t.attendeeEmail === undefined ? negOne : generateSnarkMessageHash(t.attendeeEmail).toString());
  ret.push(t.attendeeName === undefined ? negOne : generateSnarkMessageHash(t.attendeeName).toString());

  // Placeholder for reserved field
  ret.push(negOne);

  ret.push(claim.nullifierHash || negOne);

  // Public inputs appear in public signals in declaration order
  ret.push(hexToBigInt(claim.signer[0]).toString());
  ret.push(hexToBigInt(claim.signer[1]).toString());

  for (const eventId of snarkInputForValidEventIds(claim.validEventIds)) {
    ret.push(eventId);
  }
  ret.push(claim.validEventIds !== undefined ? "1" : "0"); // checkValidEventIds

  ret.push(claim.externalNullifier?.toString() || STATIC_TICKET_PCD_NULLIFIER.toString());

  ret.push(claim.watermark);

  return ret;
}

// uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[38] calldata _pubSignals
export const generateWitness = (pcd: ZKEdDSAEventTicketPCD) => {
  const _pA = pcd.proof.pi_a.slice(0, 2);
  const _pB = [pcd.proof.pi_b[0].slice(0).reverse(), pcd.proof.pi_b[1].slice(0).reverse()];
  const _pC = pcd.proof.pi_c.slice(0, 2);

  const _pubSignals = convertStringArrayToBigIntArray(publicSignalsFromClaim(pcd.claim));

  return { _pA, _pB, _pC, _pubSignals };
};
