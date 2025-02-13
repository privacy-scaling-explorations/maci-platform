import { Logger, Injectable } from "@nestjs/common";
import { ZeroAddress } from "ethers";
import hre from "hardhat";
import {
  Deployment,
  EContracts,
  ProofGenerator,
  type Poll,
  type MACI,
  type IGenerateProofsOptions,
  Poll__factory as PollFactory,
  MACI__factory as MACIFactory,
  Proof,
  Prover,
  VkRegistry,
  Verifier,
  MessageProcessor,
  Tally,
  TallyData,
} from "maci-contracts";
import { Keypair, PrivKey, PubKey } from "maci-domainobjs";
import { Hex } from "viem";

import fs from "fs";
import path from "path";

import type { IGenerateArgs, IGenerateData, IMergeArgs, ISubmitProofsArgs } from "./types";

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
    this.deployment = Deployment.getInstance({ hre });
    this.deployment.setHre(hre);
    this.logger = new Logger(ProofGeneratorService.name);
  }

  /**
   * Read and parse proofs
   * @param folder - folder path to read proofs from
   * @param type - type of proofs to read (tally or process)
   * @returns proofs
   */
  async readProofs(folder: string, type: "tally" | "process"): Promise<Proof[]> {
    const files = await fs.promises.readdir(folder);
    return Promise.all(
      files
        .filter((f) => f.startsWith(`${type}_`) && f.endsWith(".json"))
        .sort()
        .map(async (file) =>
          fs.promises.readFile(`${folder}/${file}`, "utf8").then((result) => JSON.parse(result) as Proof),
        ),
    );
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
        throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
      }

      const pollContract = await this.deployment.getContract<Poll>({
        name: EContracts.Poll,
        address: pollContracts.poll,
      });
      const [coordinatorPublicKey, isStateAqMerged] = await Promise.all([
        pollContract.coordinatorPubKey(),
        pollContract.stateMerged(),
      ]);

      if (!isStateAqMerged) {
        this.logger.error(`Error: ${ErrorCodes.NOT_MERGED_STATE_TREE}, state tree is not merged`);
        throw new Error(ErrorCodes.NOT_MERGED_STATE_TREE.toString());
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
        throw new Error(ErrorCodes.PRIVATE_KEY_MISMATCH.toString());
      }

      const outputDir = path.resolve("./proofs");

      const maciState = await ProofGenerator.prepareState({
        maciContract,
        pollContract,
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
        throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
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
      throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
    }

    // get a kernel client
    const kernelClient = await this.sessionKeysService.generateClientFromSessionKey(sessionKeyAddress, approval, chain);

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
        functionName: "mergeState",
      });

      const txHash = await kernelClient.writeContract(request);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (txReceipt.status !== "success") {
        this.logger.error(`Error: ${ErrorCodes.FAILED_TO_MERGE_STATE_TREE}, state tree merge failed`);
        throw new Error(ErrorCodes.FAILED_TO_MERGE_STATE_TREE.toString());
      }
    }

    return true;
  }

  /**
   * Submit proofs on-chain
   *
   * @param args - submit proofs on-chain arguments
   */
  async submit({
    maciContractAddress,
    pollId,
    /* TODO: use kernel Client to send write contract txs
    approval,
    sessionKeyAddress,
    */
    chain,
  }: ISubmitProofsArgs): Promise<boolean> {
    const publicClient = getPublicClient(chain);

    // get the poll address
    const pollContracts = await publicClient.readContract({
      address: maciContractAddress as Hex,
      abi: MACIFactory.abi,
      functionName: "getPoll",
      args: [BigInt(pollId)],
    });

    const pollAddress = pollContracts.poll;
    if (pollAddress.toLowerCase() === ZeroAddress.toLowerCase()) {
      this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${pollId} not found`);
      throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
    }

    // check if state tree has been merged
    const isStateMerged = await publicClient.readContract({
      address: pollAddress,
      abi: PollFactory.abi,
      functionName: "stateMerged",
    });
    if (!isStateMerged) {
      this.logger.error(`Error: ${ErrorCodes.NOT_MERGED_STATE_TREE}, state tree is not merged`);
      throw new Error(ErrorCodes.NOT_MERGED_STATE_TREE.toString());
    }

    const [maciContract, mpContract, pollContract, tallyContract, vkRegistryContract, verifierContract] =
      await Promise.all([
        this.deployment.getContract<MACI>({
          name: EContracts.MACI,
          address: maciContractAddress,
        }),
        this.deployment.getContract<MessageProcessor>({
          name: EContracts.MessageProcessor,
          address: pollContracts.messageProcessor,
        }),
        this.deployment.getContract<Poll>({
          name: EContracts.Poll,
          address: pollContracts.poll,
        }),
        this.deployment.getContract<Tally>({
          name: EContracts.Tally,
          address: pollContracts.tally,
        }),
        this.deployment.getContract<VkRegistry>({ name: EContracts.VkRegistry }),
        this.deployment.getContract<Verifier>({ name: EContracts.Verifier }),
      ]);
    const prover = new Prover({
      maciContract,
      mpContract,
      pollContract,
      tallyContract,
      vkRegistryContract,
      verifierContract,
    });

    const data = {
      processProofs: await this.readProofs(path.resolve("./proofs"), "process"),
      tallyProofs: await this.readProofs(path.resolve("./proofs"), "tally"),
    };
    // prove message processing
    await prover.proveMessageProcessing(data.processProofs);
    // read tally data
    const tallyData = await fs.promises
      .readFile("./tally.json", "utf8")
      .then((result) => JSON.parse(result) as unknown as TallyData);
    // prove tally
    await prover.proveTally(data.tallyProofs);
    // get number of participants from the registry
    const numSignUpsAndMessages = await pollContract.numSignUpsAndMessages();
    const numSignUps = numSignUpsAndMessages[0];
    /* const registryContractAddress = await pollContract.getRegistry();
    const registryContract = SimpleRegistryFactory.connect(registryContractAddress, signer);
    const recipientCount = await registryContract.recipientCount();
    await prover.submitResults(tallyData, Number.parseInt(recipientCount.toString(), 10));
    */
    // submit results
    await prover.submitResults(tallyData, Number.parseInt(numSignUps.toString(), 10));

    return true;
  }
}
