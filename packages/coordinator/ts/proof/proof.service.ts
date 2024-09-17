import { Logger, Injectable } from "@nestjs/common";
import { ZeroAddress } from "ethers";
import hre from "hardhat";
import {
  Deployment,
  EContracts,
  ProofGenerator,
  type Poll,
  type MACI,
  type AccQueue,
  type IGenerateProofsOptions,
  Poll__factory as PollFactory,
  AccQueueQuinaryMaci__factory as AccQueueQuinaryMaciFactory,
  MACI__factory as MACIFactory,
} from "maci-contracts";
import { Keypair, PrivKey, PubKey } from "maci-domainobjs";
import { Hex } from "viem";

import path from "path";

import type { IGenerateArgs, IGenerateData, IMergeArgs, IMergeMessageSubTreesArgs } from "./types";

import { ErrorCodes } from "../common";
import { getPublicClient } from "../common/accountAbstraction";
import { CryptoService } from "../crypto/crypto.service";
import { FileService } from "../file/file.service";
import { SessionKeysService } from "../sessionKeys/sessionKeys.service";

/**
 * ProofGeneratorService is responsible for generating message processing and tally proofs.
 */
@Injectable()
export class ProofGeneratorService {
  /**
   * Deployment helper
   */
  private readonly deployment: Deployment;

  /**
   * Logger
   */
  private readonly logger: Logger;

  /**
   * Proof generator initialization
   */
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly fileService: FileService,
    private readonly sessionKeysService: SessionKeysService,
  ) {
    this.deployment = Deployment.getInstance(hre);
    this.deployment.setHre(hre);
    this.logger = new Logger(ProofGeneratorService.name);
  }

  /**
   * Generate proofs for message processing and tally
   *
   * @param args - generate proofs arguments
   * @returns - generated proofs for message processing and tally
   */
  async generate(
    {
      poll,
      maciContractAddress,
      tallyContractAddress,
      useQuadraticVoting,
      encryptedCoordinatorPrivateKey,
      startBlock,
      endBlock,
      blocksPerBatch,
    }: IGenerateArgs,
    options?: IGenerateProofsOptions,
  ): Promise<IGenerateData> {
    try {
      const maciContract = await this.deployment.getContract<MACI>({
        name: EContracts.MACI,
        address: maciContractAddress,
      });

      const [signer, pollContracts] = await Promise.all([this.deployment.getDeployer(), maciContract.polls(poll)]);

      if (pollContracts.poll.toLowerCase() === ZeroAddress.toLowerCase()) {
        this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${poll} not found`);
        throw new Error(ErrorCodes.POLL_NOT_FOUND);
      }

      const pollContract = await this.deployment.getContract<Poll>({
        name: EContracts.Poll,
        address: pollContracts.poll,
      });
      const [{ messageAq: messageAqAddress }, coordinatorPublicKey, isStateAqMerged, messageTreeDepth] =
        await Promise.all([
          pollContract.extContracts(),
          pollContract.coordinatorPubKey(),
          pollContract.stateMerged(),
          pollContract.treeDepths().then((depths) => Number(depths[2])),
        ]);
      const messageAq = await this.deployment.getContract<AccQueue>({
        name: EContracts.AccQueue,
        address: messageAqAddress,
      });

      if (!isStateAqMerged) {
        this.logger.error(`Error: ${ErrorCodes.NOT_MERGED_STATE_TREE}, state tree is not merged`);
        throw new Error(ErrorCodes.NOT_MERGED_STATE_TREE);
      }

      const mainRoot = await messageAq.getMainRoot(messageTreeDepth.toString());

      if (mainRoot.toString() === "0") {
        this.logger.error(`Error: ${ErrorCodes.NOT_MERGED_MESSAGE_TREE}, message tree is not merged`);
        throw new Error(ErrorCodes.NOT_MERGED_MESSAGE_TREE);
      }

      const { privateKey } = await this.fileService.getPrivateKey();
      const maciPrivateKey = PrivKey.deserialize(
        this.cryptoService.decrypt(privateKey, encryptedCoordinatorPrivateKey),
      );
      const coordinatorKeypair = new Keypair(maciPrivateKey);
      const publicKey = new PubKey([
        BigInt(coordinatorPublicKey.x.toString()),
        BigInt(coordinatorPublicKey.y.toString()),
      ]);

      if (!coordinatorKeypair.pubKey.equals(publicKey)) {
        this.logger.error(`Error: ${ErrorCodes.PRIVATE_KEY_MISMATCH}, wrong private key`);
        throw new Error(ErrorCodes.PRIVATE_KEY_MISMATCH);
      }

      const outputDir = path.resolve("./proofs");

      const maciState = await ProofGenerator.prepareState({
        maciContract,
        pollContract,
        messageAq,
        maciPrivateKey,
        coordinatorKeypair,
        pollId: poll,
        signer,
        outputDir,
        options: {
          startBlock,
          endBlock,
          blocksPerBatch,
        },
      });

      const foundPoll = maciState.polls.get(BigInt(poll));

      if (!foundPoll) {
        this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${poll} not found in maci state`);
        throw new Error(ErrorCodes.POLL_NOT_FOUND);
      }

      const proofGenerator = new ProofGenerator({
        poll: foundPoll,
        maciContractAddress,
        tallyContractAddress,
        tally: this.fileService.getZkeyFilePaths(process.env.COORDINATOR_TALLY_ZKEY_NAME!, useQuadraticVoting),
        mp: this.fileService.getZkeyFilePaths(process.env.COORDINATOR_MESSAGE_PROCESS_ZKEY_NAME!, useQuadraticVoting),
        rapidsnark: process.env.COORDINATOR_RAPIDSNARK_EXE,
        outputDir,
        tallyOutputFile: path.resolve("./tally.json"),
        useQuadraticVoting,
      });

      const processProofs = await proofGenerator.generateMpProofs(options);
      const { proofs: tallyProofs, tallyData } = await proofGenerator.generateTallyProofs(hre.network, options);

      return {
        processProofs,
        tallyProofs,
        tallyData,
      };
    } catch (error) {
      options?.onFail?.(error as Error);
      throw error;
    }
  }

  /**
   * Merge message accumular queue sub trees
   *
   * @param args - merge message sub trees arguments
   */
  async mergeMessageSubTrees({
    publicClient,
    kernelClient,
    pollAddress,
    messageAqAddress,
  }: IMergeMessageSubTreesArgs): Promise<void> {
    let subTreesMerged = false;

    while (!subTreesMerged) {
      // eslint-disable-next-line no-await-in-loop
      subTreesMerged = await publicClient.readContract({
        address: messageAqAddress,
        abi: AccQueueQuinaryMaciFactory.abi,
        functionName: "subTreesMerged",
      });

      if (subTreesMerged) {
        this.logger.debug("All subtrees are merged");
      } else {
        // eslint-disable-next-line no-await-in-loop
        const indices = await publicClient.readContract({
          address: messageAqAddress,
          abi: AccQueueQuinaryMaciFactory.abi,
          functionName: "getSrIndices",
        });

        this.logger.debug(`Merging message subroots ${indices[0] + 1n} / ${indices[1] + 1n}`);

        // eslint-disable-next-line no-await-in-loop
        const { request } = await publicClient.simulateContract({
          account: kernelClient.account.address,
          address: pollAddress,
          abi: PollFactory.abi,
          functionName: "mergeMessageAqSubRoots",
          args: [4n],
        });

        // eslint-disable-next-line no-await-in-loop
        const txHash = await kernelClient.writeContract(request);

        // eslint-disable-next-line no-await-in-loop
        const txReceipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (txReceipt.status !== "success") {
          this.logger.error(`Error: ${ErrorCodes.FAILED_TO_MERGE_MESSAGE_SUBTREES}, message subtree merge failed`);
          throw new Error(ErrorCodes.FAILED_TO_MERGE_MESSAGE_SUBTREES);
        }
      }
    }
  }

  /**
   * Merge state and message trees
   *
   * @param args - merge arguments
   * @returns whether the proofs were successfully merged
   */
  async merge({ maciContractAddress, pollId, approval, sessionKeyAddress, chain }: IMergeArgs): Promise<boolean> {
    const publicClient = getPublicClient(chain);

    const pollContracts = await publicClient.readContract({
      address: maciContractAddress as Hex,
      abi: MACIFactory.abi,
      functionName: "getPoll",
      args: [BigInt(pollId)],
    });

    const pollAddress = pollContracts.poll;

    if (pollAddress.toLowerCase() === ZeroAddress.toLowerCase()) {
      this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${pollId} not found`);
      throw new Error(ErrorCodes.POLL_NOT_FOUND);
    }

    // get a kernel client
    const kernelClient = await this.sessionKeysService.generateClientFromSessionKey(sessionKeyAddress, approval, chain);

    // get external contracts
    const externalContracts = await publicClient.readContract({
      address: pollAddress,
      abi: PollFactory.abi,
      functionName: "extContracts",
    });

    // start with the state tree
    const isStateMerged = await publicClient.readContract({
      address: pollAddress,
      abi: PollFactory.abi,
      functionName: "stateMerged",
    });

    if (isStateMerged) {
      this.logger.debug("State tree is already merged");
    } else {
      // merge it
      const { request } = await publicClient.simulateContract({
        // @ts-expect-error type error between permissionless.js and viem
        account: kernelClient.account,
        address: pollAddress,
        abi: PollFactory.abi,
        functionName: "mergeMaciState",
      });

      const txHash = await kernelClient.writeContract(request);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (txReceipt.status !== "success") {
        this.logger.error(`Error: ${ErrorCodes.FAILED_TO_MERGE_STATE_TREE}, state tree merge failed`);
        throw new Error(ErrorCodes.FAILED_TO_MERGE_STATE_TREE);
      }
    }

    // merge the message sub trees first
    await this.mergeMessageSubTrees({
      publicClient,
      kernelClient,
      pollAddress,
      messageAqAddress: externalContracts[1],
    });

    // then merge the main root
    const messageTreeDepth = await publicClient
      .readContract({
        address: pollAddress,
        abi: PollFactory.abi,
        functionName: "treeDepths",
      })
      .then((depths) => BigInt(depths[2]));

    const mainRoot = await publicClient.readContract({
      address: externalContracts[1],
      abi: AccQueueQuinaryMaciFactory.abi,
      functionName: "getMainRoot",
      args: [messageTreeDepth],
    });

    if (mainRoot.toString() === "0") {
      this.logger.debug(`Message tree is not merged yet`);

      const { request } = await publicClient.simulateContract({
        // @ts-expect-error type error between permissionless.js and viem
        account: kernelClient.account,
        address: pollAddress,
        abi: PollFactory.abi,
        functionName: "mergeMessageAq",
        args: [],
      });

      const txHash = await kernelClient.writeContract(request);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (txReceipt.status === "success") {
        this.logger.debug(`Message tree has been merged`);
      } else {
        this.logger.error(`Error: ${ErrorCodes.FAILED_TO_MERGE_MESSAGE_TREE}, message tree merge failed`);
        throw new Error(ErrorCodes.FAILED_TO_MERGE_MESSAGE_TREE);
      }
    } else {
      this.logger.debug(`Message tree has already been merged`);
    }

    return true;
  }
}
