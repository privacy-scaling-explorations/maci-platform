/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import { BaseContract } from "ethers";
import { task, types } from "hardhat/config";
import { ContractStorage, Deployment, Proof, Prover, type TallyData } from "maci-contracts";

import fs from "fs";

import {
  type VkRegistry,
  type Verifier,
  type MACI,
  type Poll,
  type AccQueue,
  type MessageProcessor,
  type Tally,
  type SimpleRegistry,
} from "../../typechain-types";
import { EContracts, ISubmitOnChainParams } from "../helpers/constants";

/**
 * Prove hardhat task for submitting proofs on-chain as well as uploading tally results
 */
task("submitOnChain", "Command to prove the result of a poll on-chain")
  .addParam("poll", "The poll id", undefined, types.string)
  .addParam("outputDir", "Output directory for proofs", undefined, types.string)
  .addParam("tallyFile", "The file to store the tally proof", undefined, types.string)
  .setAction(async ({ outputDir, poll, tallyFile }: ISubmitOnChainParams, hre) => {
    const deployment = Deployment.getInstance();

    deployment.setHre(hre);
    deployment.setContractNames(EContracts);

    const storage = ContractStorage.getInstance();
    // if we do not have the output directory just create it
    const isOutputDirExists = fs.existsSync(outputDir);

    if (!isOutputDirExists) {
      // Create the directory
      throw new Error(
        `Output directory ${outputDir} does not exist. You must provide a valid directory containing the poll zk-SNARK proofs.`,
      );
    }

    const signer = await deployment.getDeployer();
    const { network } = hre;

    const startBalance = await signer.provider.getBalance(signer);

    console.log("Start balance: ", Number(startBalance / 10n ** 12n) / 1e6);

    const {
      MACI__factory: MACIFactory,
      Poll__factory: PollFactory,
      Tally__factory: TallyFactory,
      SimpleRegistry__factory: SimpleRegistryFactory,
    } = await import("../../typechain-types");

    const maciContractAddress = storage.mustGetAddress(EContracts.MACI, network.name);
    const maciContract = await deployment.getContract<MACI>({
      name: EContracts.MACI,
      address: maciContractAddress,
      abi: MACIFactory.abi,
    });
    const vkRegistryContract = await deployment.getContract<VkRegistry>({ name: EContracts.VkRegistry });
    const verifierContract = await deployment.getContract<Verifier>({ name: EContracts.Verifier });

    const pollContracts = await maciContract.polls(poll);
    const pollContract = await deployment.getContract<Poll>({
      name: EContracts.Poll,
      address: pollContracts.poll,
      abi: PollFactory.abi,
    });

    const [, messageAqContractAddress] = await pollContract.extContracts();
    const messageAqContract = await deployment.getContract<AccQueue>({
      name: EContracts.AccQueue,
      address: messageAqContractAddress,
    });
    const isStateAqMerged = await pollContract.stateMerged();

    // Check that the state and message trees have been merged for at least the first poll
    if (!isStateAqMerged && poll.toString() === "0") {
      throw new Error("The state tree has not been merged yet. Please use the mergeSignups subcommand to do so.");
    }

    const messageTreeDepth = await pollContract.treeDepths().then((depths) => Number(depths[2]));

    // check that the main root is set
    const mainRoot = await messageAqContract.getMainRoot(messageTreeDepth.toString());

    if (mainRoot.toString() === "0") {
      throw new Error("The message tree has not been merged yet. Please use the mergeMessages subcommand to do so.");
    }

    const mpContract = await deployment.getContract<MessageProcessor>({
      name: EContracts.MessageProcessor,
      address: pollContracts.messageProcessor,
    });

    // get the tally contract based on the useQuadraticVoting flag
    const tallyContract = await deployment.getContract<Tally>({
      name: EContracts.Tally,
      address: pollContracts.tally,
      abi: TallyFactory.abi,
    });

    const data = {
      processProofs: [] as Proof[],
      tallyProofs: [] as Proof[],
    };

    // read the proofs from the output directory
    const files = await fs.promises.readdir(outputDir);

    // Read process proofs
    const processProofFiles = files.filter((f) => f.startsWith("process_") && f.endsWith(".json"));
    await Promise.all(
      processProofFiles.sort().map(async (file) => {
        const proofData = JSON.parse(await fs.promises.readFile(`${outputDir}/${file}`, "utf8")) as Proof;
        data.processProofs.push(proofData);
      }),
    );

    // Read tally proofs
    const tallyProofFiles = files.filter((f) => f.startsWith("tally_") && f.endsWith(".json"));
    await Promise.all(
      tallyProofFiles.sort().map(async (file) => {
        const proofData = JSON.parse(await fs.promises.readFile(`${outputDir}/${file}`, "utf8")) as Proof;
        data.tallyProofs.push(proofData);
      }),
    );

    const prover = new Prover({
      maciContract,
      messageAqContract,
      mpContract,
      pollContract,
      vkRegistryContract,
      verifierContract,
      tallyContract,
    });

    await prover.proveMessageProcessing(data.processProofs);

    // read tally data
    const tallyData = JSON.parse(await fs.promises.readFile(tallyFile, "utf8")) as unknown as TallyData;

    await prover.proveTally(data.tallyProofs);

    // submit the results with number participants to be taken from the registry
    const registryContractAddress = await pollContract.getRegistry();

    const registryContract = new BaseContract(
      registryContractAddress,
      SimpleRegistryFactory.abi,
      signer,
    ) as SimpleRegistry;
    const recipientCount = await registryContract.recipientCount();

    await prover.submitResults(tallyData, Number.parseInt(recipientCount.toString(), 10));

    const endBalance = await signer.provider.getBalance(signer);

    console.log("End balance: ", Number(endBalance / 10n ** 12n) / 1e6);
    console.log("Prove expenses: ", Number((startBalance - endBalance) / 10n ** 12n) / 1e6);
  });
