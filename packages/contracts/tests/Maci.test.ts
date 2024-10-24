import { expect } from "chai";
import { encodeBytes32String, Signer, ZeroAddress } from "ethers";
import { Verifier, VkRegistry, EMode, getSigners, deployContract } from "maci-contracts";
import { MaciState } from "maci-core";
import { Keypair, Message, PubKey } from "maci-domainobjs";

import { MACI, Poll__factory as PollFactory, Poll as PollContract } from "../typechain-types";

import {
  NOTHING_UP_MY_SLEEVE,
  STATE_TREE_DEPTH,
  DURATION,
  INITIAL_VOICE_CREDIT_BALANCE,
  MESSAGE_BATCH_SIZE,
  treeDepths,
} from "./constants";
import { deployTestContracts } from "./utils";

describe("Maci", () => {
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
  const maxRecipients = 5;
  const metadataUrl = encodeBytes32String("url");

  describe("deployment", () => {
    before(async () => {
      [owner, user] = await getSigners();

      const contracts = await deployTestContracts({
        initialVoiceCreditBalance: INITIAL_VOICE_CREDIT_BALANCE,
        stateTreeDepth: STATE_TREE_DEPTH,
        signer: owner,
      });
      maciContract = contracts.maciContract;
      verifierContract = contracts.mockVerifierContract as Verifier;
      vkRegistryContract = contracts.vkRegistryContract;

      // deploy on chain poll
      const tx = await maciContract.deployPoll(
        DURATION,
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
      const p = maciState.deployPoll(BigInt(deployTime + DURATION), treeDepths, MESSAGE_BATCH_SIZE, coordinator);
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
    });

    it("should fail if unauthorized user tries to set the poll registry", async () => {
      await expect(
        maciContract.connect(user).setPollRegistry(pollId, await user.getAddress()),
      ).to.be.revertedWithCustomError(maciContract, "OwnableUnauthorizedAccount");
    });

    it("should fail if try to set zero address as registry", async () => {
      await expect(maciContract.setPollRegistry(pollId, ZeroAddress)).to.be.revertedWithCustomError(
        pollContract,
        "InvalidAddress",
      );
    });

    it("should not be possible to init the Poll contract twice", async () => {
      const registry = await deployContract(
        "MockRegistry",
        owner,
        true,
        maxRecipients,
        metadataUrl,
        await owner.getAddress(),
      );

      const registryAddress = await registry.getAddress();

      const receipt = await maciContract.setPollRegistry(pollId, registryAddress).then((tx) => tx.wait());

      expect(receipt?.status).to.equal(1);

      await expect(maciContract.initPoll(pollId)).not.to.be.revertedWithCustomError(pollContract, "PollAlreadyInit");
      await expect(maciContract.initPoll(pollId)).to.be.revertedWithCustomError(
        pollContract,
        "OwnableUnauthorizedAccount",
      );
    });

    it("should not be possible to set zero address as registry manager", async () => {
      await expect(maciContract.setRegistryManager(ZeroAddress)).to.be.revertedWithCustomError(
        maciContract,
        "InvalidAddress",
      );
    });

    it("should not be possible to set registry manager by non-owner", async () => {
      const registryManager = await deployContract("RegistryManager", owner, true);

      await expect(
        maciContract.connect(user).setRegistryManager(await registryManager.getAddress()),
      ).to.be.revertedWithCustomError(maciContract, "OwnableUnauthorizedAccount");
    });

    it("should set registry manager properly", async () => {
      const registryManager = await deployContract("RegistryManager", owner, true);
      const registryManagerContractAddress = await registryManager.getAddress();

      const tx = await maciContract.setRegistryManager(registryManagerContractAddress);
      await tx.wait();

      expect(await maciContract.registryManager()).to.equal(registryManagerContractAddress);
    });
  });
});
