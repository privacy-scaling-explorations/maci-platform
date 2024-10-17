import { expect } from "chai";
import { encodeBytes32String, parseUnits, Signer } from "ethers";
import {
  getSigners,
  deployContract,
  EMode,
  MessageProcessor,
  MockVerifier,
  VkRegistry,
  MessageProcessor__factory as MessageProcessorFactory,
  IVerifyingKeyStruct,
} from "maci-contracts";
import { genTreeProof } from "maci-crypto";
import { Keypair, Message, PCommand, PubKey } from "maci-domainobjs";

import {
  Tally,
  ERC20,
  Poll,
  IRecipientRegistry,
  MACI,
  Poll__factory as PollFactory,
  Tally__factory as TallyFactory,
} from "../typechain-types";

import {
  INITIAL_VOICE_CREDIT_BALANCE,
  MESSAGE_BATCH_SIZE,
  PER_VO_SPENT_VOICE_CREDITS,
  STATE_TREE_DEPTH,
  TALLY_RESULTS,
  TEST_PROCESS_VK,
  TEST_TALLY_VK,
  TOTAL_SPENT_VOICE_CREDITS,
  treeDepths,
} from "./constants";
import { deployTestContracts, timeTravel } from "./utils";

describe("Tally", () => {
  let payoutToken: ERC20;
  let poll: Poll;
  let tally: Tally;
  let maci: MACI;
  let messageProcessor: MessageProcessor;
  let registry: IRecipientRegistry;
  let verifier: MockVerifier;
  let vkRegistry: VkRegistry;
  let owner: Signer;
  let user: Signer;
  let project: Signer;

  let ownerAddress: string;
  let projectAddress: string;

  const maxRecipients = TALLY_RESULTS.tally.length;

  const cooldownTime = 1_000;
  const metadataUrl = encodeBytes32String("url");
  const maxContribution = parseUnits("5", 18);
  const duration = 100;
  const keypair = new Keypair();

  const emptyClaimParams = {
    index: 0,
    voiceCreditsPerOption: 0,
    tallyResult: 0,
    totalSpent: 0,
    tallyResultProof: [],
    tallyResultSalt: 0,
    voteOptionTreeDepth: 0,
    spentVoiceCreditsHash: 0,
    perVOSpentVoiceCreditsHash: 0,
  };

  before(async () => {
    [owner, user, project] = await getSigners();
    [ownerAddress, , projectAddress] = await Promise.all([owner.getAddress(), user.getAddress(), project.getAddress()]);

    payoutToken = await deployContract("MockERC20", owner, true, "Payout token", "PT");

    const contracts = await deployTestContracts({
      initialVoiceCreditBalance: INITIAL_VOICE_CREDIT_BALANCE,
      stateTreeDepth: STATE_TREE_DEPTH,
      signer: owner,
    });
    maci = contracts.maciContract;
    verifier = contracts.mockVerifierContract;
    vkRegistry = contracts.vkRegistryContract;

    await vkRegistry.setVerifyingKeys(
      STATE_TREE_DEPTH,
      treeDepths.intStateTreeDepth,
      treeDepths.messageTreeDepth,
      treeDepths.voteOptionTreeDepth,
      MESSAGE_BATCH_SIZE,
      EMode.QV,
      TEST_PROCESS_VK.asContractParam() as IVerifyingKeyStruct,
      TEST_TALLY_VK.asContractParam() as IVerifyingKeyStruct,
    );

    await maci
      .deployPoll(duration, treeDepths, keypair.pubKey.asContractParam(), verifier, vkRegistry, EMode.QV)
      .then((tx) => tx.wait());

    registry = await deployContract("SimpleRegistry", owner, true, maxRecipients, metadataUrl, ownerAddress);

    await maci.setPollRegistry(0n, registry).then((tx) => tx.wait());
    await maci.initPoll(0n).then((tx) => tx.wait());

    const pollContracts = await maci.getPoll(0n);
    poll = PollFactory.connect(pollContracts.poll, owner);
    tally = TallyFactory.connect(pollContracts.tally, owner);
    messageProcessor = MessageProcessorFactory.connect(pollContracts.messageProcessor, owner);

    const messages: [Message, PubKey][] = [];
    for (let i = 0; i < 2; i += 1) {
      const command = new PCommand(1n, keypair.pubKey, 0n, 9n, 1n, 0n, BigInt(i));
      const signature = command.sign(keypair.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(keypair.privKey, keypair.pubKey);
      const message = command.encrypt(signature, sharedKey);
      messages.push([message, keypair.pubKey]);
    }

    await poll
      .publishMessageBatch(
        messages.map(([m]) => m.asContractParam()),
        messages.map(([, k]) => k.asContractParam()),
      )
      .then((tx) => tx.wait());
  });

  it("should deploy and initialize with small contribution amount properly", async () => {
    await maci
      .deployPoll(duration, treeDepths, keypair.pubKey.asContractParam(), verifier, vkRegistry, EMode.QV)
      .then((tx) => tx.wait());

    await maci.setPollRegistry(1n, registry).then((tx) => tx.wait());
    await maci.initPoll(1n).then((tx) => tx.wait());

    const pollContracts = await maci.getPoll(1n);
    const tallyContract = TallyFactory.connect(pollContracts.tally, owner);

    const receipt = await tallyContract
      .init({
        cooldownTime,
        maxContribution: 1,
        payoutToken,
      })
      .then((tx) => tx.wait());

    expect(receipt?.status).to.equal(1);
    expect(await tallyContract.voiceCreditFactor()).to.equal(1n);
  });

  it("should not allow to deposit/claim/withdraw/addTallyResults before initialization", async () => {
    await expect(tally.deposit(1n)).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(tally.withdrawExtra([], [])).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(
      tally.addTallyResults(
        [],
        [],
        [],
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      ),
    ).to.be.revertedWithCustomError(tally, "NotInitialized");
  });

  it("should not allow non-owner to initialize tally", async () => {
    await expect(
      tally.connect(user).init({
        cooldownTime,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        payoutToken,
      }),
    ).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should initialize tally properly", async () => {
    const receipt = await tally
      .init({
        cooldownTime,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        payoutToken,
      })
      .then((tx) => tx.wait());

    expect(receipt?.status).to.equal(1);
  });

  it("should not allow to initialize tally twice", async () => {
    await expect(
      tally.init({
        cooldownTime,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        payoutToken,
      }),
    ).to.be.revertedWithCustomError(tally, "AlreadyInitialized");
  });

  it("should deposit funds properly", async () => {
    const [decimals, initialBalance] = await Promise.all([payoutToken.decimals(), payoutToken.balanceOf(owner)]);
    const ownerAmount = parseUnits(TOTAL_SPENT_VOICE_CREDITS.spent, decimals);
    const userAmount = parseUnits("2", decimals);

    await payoutToken.approve(user, userAmount).then((tx) => tx.wait());
    await payoutToken.transfer(user, userAmount);

    await payoutToken.approve(tally, ownerAmount).then((tx) => tx.wait());
    await tally.deposit(ownerAmount).then((tx) => tx.wait());

    await payoutToken
      .connect(user)
      .approve(tally, userAmount)
      .then((tx) => tx.wait());
    await tally
      .connect(user)
      .deposit(userAmount)
      .then((tx) => tx.wait());

    const [tokenBalance, totalAmount] = await Promise.all([payoutToken.balanceOf(tally), tally.totalAmount()]);

    expect(totalAmount).to.equal(tokenBalance);
    expect(initialBalance - tokenBalance).to.equal(initialBalance - ownerAmount - userAmount);
  });

  it("should not withdraw extra if cooldown period is not over", async () => {
    await expect(tally.withdrawExtra([owner, user], [1n])).to.be.revertedWithCustomError(
      tally,
      "CooldownPeriodNotOver",
    );
  });

  it("should not allow non-owner to withdraw funds", async () => {
    await expect(tally.connect(user).withdrawExtra([owner, user], [1n])).to.be.revertedWithCustomError(
      tally,
      "OwnableUnauthorizedAccount",
    );
  });

  it("should not allow non-owner to pause/unpause", async () => {
    await expect(tally.connect(user).pause()).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");

    await expect(tally.connect(user).unpause()).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should not allow to call functions if contract is paused", async () => {
    try {
      await tally.pause().then((tx) => tx.wait());

      await expect(tally.deposit(1n)).to.be.revertedWithCustomError(tally, "EnforcedPause");

      await expect(tally.withdrawExtra([owner, user], [1n])).to.be.revertedWithCustomError(tally, "EnforcedPause");

      await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "EnforcedPause");
    } finally {
      await tally.unpause().then((tx) => tx.wait());
    }
  });

  it("should not allow to add tally results before voting deadline", async () => {
    await expect(
      tally.addTallyResults(
        [],
        [],
        [],
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      ),
    ).to.be.revertedWithCustomError(tally, "VotingPeriodNotOver");
  });

  it("should not allow to claim before voting deadline", async () => {
    await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "VotingPeriodNotOver");
  });

  it("should not allow to claim funds if there are no any votes", async () => {
    await timeTravel(cooldownTime + duration, owner);

    await expect(tally.claim(emptyClaimParams).then((tx) => tx.wait())).to.be.revertedWithCustomError(
      tally,
      "NoProjectHasMoreThanOneVote",
    );
  });

  it("should not allow non-owner to add tally results", async () => {
    await expect(
      tally
        .connect(user)
        .addTallyResults(
          [],
          [],
          [],
          TALLY_RESULTS.salt,
          TOTAL_SPENT_VOICE_CREDITS.commitment,
          PER_VO_SPENT_VOICE_CREDITS.commitment,
        ),
    ).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should add tally results properly", async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await registry
        .addRecipient({
          id: encodeBytes32String(index.toString()),
          metadataUrl,
          recipient: projectAddress,
        })
        .then((tx) => tx.wait());
    }

    await poll.mergeMaciState().then((tx) => tx.wait());
    await poll.mergeMessageAqSubRoots(4).then((tx) => tx.wait());
    await poll.mergeMessageAq().then((tx) => tx.wait());

    await messageProcessor.processMessages(0n, [0, 0, 0, 0, 0, 0, 0, 0]);
    await tally.tallyVotes(
      14233750085429709079626724186351653560210151525264608035972235393198738498917n,
      [0, 0, 0, 0, 0, 0, 0, 0],
    );

    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const indices = TALLY_RESULTS.tally.map((_, index) => index);
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    await expect(
      tally.addTallyResults(
        [0],
        [TALLY_RESULTS.tally[0]],
        [invalidProof],
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      ),
    ).to.be.revertedWithCustomError(tally, "InvalidTallyVotesProof");

    const firstReceipt = await tally
      .addTallyResults(
        indices.slice(1),
        tallyResults.slice(1),
        tallyResultProofs.slice(1),
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      )
      .then((tx) => tx.wait());

    expect(firstReceipt?.status).to.equal(1);

    await expect(
      tally.claim({
        index: 0,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[0],
        tallyResult: tallyResults[0],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof: tallyResultProofs[0],
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth: treeDepths.voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "NotCompletedResults");

    const additionalProof = genTreeProof(tallyResults.length, tallyResults.concat(0n), treeDepths.voteOptionTreeDepth);

    await expect(
      tally.addTallyResults(
        [indices[0], tallyResults.length],
        [tallyResults[0], 0n],
        [tallyResultProofs[0], additionalProof],
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      ),
    ).to.be.revertedWithCustomError(tally, "TooManyResults");

    const lastReceipt = await tally
      .addTallyResults(
        indices.slice(0, 1),
        tallyResults.slice(0, 1),
        tallyResultProofs.slice(0, 1),
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      )
      .then((tx) => tx.wait());

    expect(lastReceipt?.status).to.equal(1);
  });

  it("should not allow to add tally results twice", async () => {
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    await expect(
      tally.addTallyResults(
        [0],
        [TALLY_RESULTS.tally[0]],
        [invalidProof],
        TALLY_RESULTS.salt,
        TOTAL_SPENT_VOICE_CREDITS.commitment,
        PER_VO_SPENT_VOICE_CREDITS.commitment,
      ),
    ).to.be.revertedWithCustomError(tally, "TooManyResults");
  });

  it("should not claim funds for the project if proof generation is failed", async () => {
    const voteOptionTreeDepth = 3;
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: TALLY_RESULTS.tally[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof: invalidProof,
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      await expect(tally.claim(params)).to.be.revertedWithCustomError(tally, "InvalidTallyVotesProof");
    }
  });

  it("should calculate rewards per project", async () => {
    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const voiceCreditsPerOptions = PER_VO_SPENT_VOICE_CREDITS.tally.map((x) => BigInt(x));
    const budget = await payoutToken.balanceOf(tally);

    const expectedRewards = [
      9012413244165830783n,
      1552310421321149129846n,
      3456104942999765660263n,
      606317844329397788254n,
      83908671708440493505n,
      114053640482546893023n,
      339053188661031771904n,
      32631150239393525252n,
      1763946736951215707909n,
      3425959975385659260745n,
      544474046722880535633n,
      465226967954353402878n,
      0n,
    ];

    const amounts = await tally.getAllocatedAmounts(
      budget,
      voiceCreditsPerOptions,
      TOTAL_SPENT_VOICE_CREDITS.spent,
      tallyResults,
    );

    for (let index = 0; index < amounts.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const amount = await tally.getAllocatedAmount(
        budget,
        voiceCreditsPerOptions[index],
        TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResults[index],
      );

      expect(amounts[index].toString()).to.equal(amount.toString());
      expect(amount).to.equal(expectedRewards[index]);
    }
  });

  it("should claim funds properly for the project", async () => {
    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const tallyResultProof = tallyResultProofs[index];

      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: tallyResults[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof,
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth: treeDepths.voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      await tally.claim(params).then((tx) => tx.wait());
    }
  });

  it("should not claim funds for the project if funds are already claimed", async () => {
    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: TALLY_RESULTS.tally[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof: tallyResultProofs[index],
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth: treeDepths.voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      await expect(tally.claim(params)).to.be.revertedWithCustomError(tally, "AlreadyClaimed");
    }
  });

  it("should not allow to claim funds if there are not enough funds", async () => {
    const total = await payoutToken.balanceOf(tally);

    const params = {
      index: 0n,
      voiceCreditsPerOption: 0n,
      tallyResult: 1n,
      totalSpent: total + 1n,
      tallyResultProof: [],
      tallyResultSalt: 0n,
      voteOptionTreeDepth: 2,
      spentVoiceCreditsHash: 0n,
      perVOSpentVoiceCreditsHash: 0n,
    };

    await expect(tally.claim({ ...params }).then((tx) => tx.wait())).to.be.revertedWithCustomError(
      tally,
      "InvalidBudget",
    );
  });

  it("should withdraw extra after cooldown properly", async () => {
    const [contractBalance, initialOwnerBalance, totalAmount] = await Promise.all([
      payoutToken.balanceOf(tally),
      payoutToken.balanceOf(owner),
      tally.totalAmount(),
    ]);

    await tally.withdrawExtra([owner, user], [totalAmount, 0]).then((tx) => tx.wait());

    const [balance, ownerBalance, totalExtraFunds] = await Promise.all([
      payoutToken.balanceOf(tally),
      payoutToken.balanceOf(owner),
      tally.totalAmount(),
    ]);

    expect(balance).to.equal(0n);
    expect(totalExtraFunds).to.equal(0n);
    expect(initialOwnerBalance + totalAmount).to.equal(ownerBalance);
    expect(contractBalance).to.equal(totalAmount);
  });

  it("should not withdraw extra if there is no enough funds", async () => {
    await expect(tally.withdrawExtra([owner], [maxContribution])).to.be.revertedWithCustomError(
      tally,
      "InvalidWithdrawal",
    );
  });

  it("should not deposit after voting period is over", async () => {
    await expect(tally.deposit(1n)).to.be.revertedWithCustomError(tally, "VotingPeriodOver");
  });
});
