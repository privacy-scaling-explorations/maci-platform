import { expect } from "chai";
import { Signer } from "ethers";
import { Verifier, VkRegistry, EMode, getSigners } from "maci-contracts";
import { MaciState } from "maci-core";
import { Keypair, Message, PubKey } from "maci-domainobjs";

import { MACI, Poll__factory as PollFactory, Poll as PollContract } from "../typechain-types";

import {
  NOTHING_UP_MY_SLEEVE,
  STATE_TREE_DEPTH,
  duration,
  initialVoiceCreditBalance,
  messageBatchSize,
  treeDepths,
} from "./constants";
import { deployTestContracts } from "./utils";

describe("Poll", () => {
  let maciContract: MACI;
  let pollId: bigint;
  let pollContract: PollContract;
  let verifierContract: Verifier;
  let vkRegistryContract: VkRegistry;
  let owner: Signer;
  let user: Signer;
  let deployTime: number;
  const coordinator = new Keypair();

  const maciState = new MaciState(STATE_TREE_DEPTH);

  describe("deployment", () => {
    before(async () => {
      [owner, user] = await getSigners();

      const contracts = await deployTestContracts({
        initialVoiceCreditBalance,
        stateTreeDepth: STATE_TREE_DEPTH,
        signer: owner,
      });
      maciContract = contracts.maciContract;
      verifierContract = contracts.mockVerifierContract as Verifier;
      vkRegistryContract = contracts.vkRegistryContract;

      // deploy on chain poll
      const tx = await maciContract.deployPoll(
        duration,
        treeDepths,
        coordinator.pubKey.asContractParam(),
        verifierContract,
        vkRegistryContract,
        EMode.QV,
      );
      const receipt = await tx.wait();

      const block = await owner.provider!.getBlock(receipt!.blockHash);
      deployTime = block!.timestamp;

      expect(receipt?.status).to.eq(1);

      pollId = (await maciContract.nextPollId()) - 1n;

      const pollContracts = await maciContract.getPoll(pollId);
      pollContract = PollFactory.connect(pollContracts.poll, owner);

      // deploy local poll
      const p = maciState.deployPoll(BigInt(deployTime + duration), treeDepths, messageBatchSize, coordinator);
      expect(p.toString()).to.eq(pollId.toString());
      // publish the NOTHING_UP_MY_SLEEVE message
      const messageData = [NOTHING_UP_MY_SLEEVE];
      for (let i = 1; i < 10; i += 1) {
        messageData.push(BigInt(0));
      }
      const message = new Message(messageData);
      const padKey = new PubKey([
        BigInt("10457101036533406547632367118273992217979173478358440826365724437999023779287"),
        BigInt("19824078218392094440610104313265183977899662750282163392862422243483260492317"),
      ]);
      maciState.polls.get(pollId)?.publishMessage(message, padKey);
    });

    it("should fail if unauthorized user tries to init the poll", async () => {
      await expect(maciContract.initPoll(pollId)).not.to.be.revertedWithCustomError(pollContract, "PollAlreadyInit");
      await expect(maciContract.connect(user).initPoll(pollId)).to.be.revertedWithCustomError(
        pollContract,
        "OwnableUnauthorizedAccount",
      );
      await expect(pollContract.init()).to.be.revertedWithCustomError(pollContract, "PollAlreadyInit");
    });

    it("should not be possible to init the Poll contract twice", async () => {
      await expect(maciContract.initPoll(pollId)).not.to.be.revertedWithCustomError(pollContract, "PollAlreadyInit");
      await expect(maciContract.initPoll(pollId)).to.be.revertedWithCustomError(
        pollContract,
        "OwnableUnauthorizedAccount",
      );
      await expect(pollContract.init()).to.be.revertedWithCustomError(pollContract, "PollAlreadyInit");
    });
  });
});
