import { TreeDepths, MESSAGE_TREE_ARITY } from "maci-core";
import { G1Point, G2Point } from "maci-crypto";
import { VerifyingKey } from "maci-domainobjs";

export const STATE_TREE_DEPTH = 10;
export const MESSAGE_TREE_DEPTH = 2;
export const MESSAGE_TREE_SUBDEPTH = 1;
export const MESSAGE_BATCH_SIZE = MESSAGE_TREE_ARITY ** MESSAGE_TREE_SUBDEPTH;
export const NOTHING_UP_MY_SLEEVE = 8370432830353022751713833565135785980866757267633941821328460903436894336785n;
export const DEFAULT_SR_QUEUE_OPS = 4;

export const DURATION = 2_000;
export const INITIAL_VOICE_CREDIT_BALANCE = 1000;

export const TEST_PROCESS_VK = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))],
);

export const TEST_TALLY_VK = new VerifyingKey(
  new G1Point(BigInt(0), BigInt(1)),
  new G2Point([BigInt(2), BigInt(3)], [BigInt(4), BigInt(5)]),
  new G2Point([BigInt(6), BigInt(7)], [BigInt(8), BigInt(9)]),
  new G2Point([BigInt(10), BigInt(11)], [BigInt(12), BigInt(13)]),
  [new G1Point(BigInt(14), BigInt(15)), new G1Point(BigInt(16), BigInt(17))],
);

export const treeDepths: TreeDepths = {
  intStateTreeDepth: 1,
  messageTreeDepth: MESSAGE_TREE_DEPTH,
  messageTreeSubDepth: MESSAGE_TREE_SUBDEPTH,
  voteOptionTreeDepth: 3,
};

export const TALLY_RESULTS = {
  tally: ["12", "107", "159", "67", "26", "35", "53", "17", "114", "158", "65", "60", "0"],
  salt: "0xed6956a31ec7a8d7c71e4d9bb90f70281e45e7977644268af3cc061c384feae",
  commitment: "0x1f6ebdc3299a1c2eef28cfa14822c4a1e0a607a4044f6aa4434b1b80f1b79ef7",
};

export const TOTAL_SPENT_VOICE_CREDITS = {
  spent: "12391",
  salt: "0x269f6c1a1a34bc13d7369fb93323590504f37edf41d952d5f9e8cf814381c475",
  commitment: "0x1f5c444c5dbc821ad8eb76bcfd8966468eca73c08b98cf1504d312751d61b908",
};

export const PER_VO_SPENT_VOICE_CREDITS = {
  tally: ["86", "1459", "3039", "587", "136", "491", "627", "79", "1644", "2916", "721", "606", "0"],
  salt: "0x1f31c9ed6fb5f2beb54c32edbc922a87d467c31d0178c8427fbb7d978048ade7",
  commitment: "0xdf601b181267173f055d90e5fb286637634317c29aa57478800077a0f9bc839",
};
