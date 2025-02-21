import { KernelAccountClient } from "@zerodev/sdk";
import { JsonRpcSigner } from "ethers";
import {
  IPublishBatchArgs,
  IPublishBatchData,
  PubKey,
  MACI__factory as MACIFactory,
  Poll__factory as PollFactory,
} from "maci-cli/sdk";
import { genRandomSalt } from "maci-crypto";
import { IG1ContractParams, IMessageContractParams, Keypair, PCommand, PrivKey } from "maci-domainobjs";
import { createPublicClient, Hex, http, parseEventLogs, Address, Chain, encodeFunctionData, Transport } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { optimismSepolia } from "viem/chains";

import { config, getBundlerURL } from "~/config";
import { KernelAccount } from "~/hooks/useAccount";

const MESSAGE_TREE_ARITY = 5;

interface ISmartAccountPublishBatchArgs extends IPublishBatchArgs {
  smartAccount: KernelAccount;
  smartAccountClient: KernelAccountClient<Transport, Chain>;
}

// a public client to interact with the chain
export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
  chain: optimismSepolia,
});

// a bundler client to interact with the bundler
export const bundlerClient = createBundlerClient({
  chain: config.network,
  transport: http(getBundlerURL()),
});

/**
 * Modified signup function from maci-cli/sdk to signup user to MACI contract
 * @param {KernelEcdsaSmartAccount<EntryPoint, HttpTransport, Chain>} smartAccount - The smart account to sign the user operation with
 * @param {SmartAccountClient<EntryPoint, HttpTransport, Chain>} smartAccountClient - The smart account client to send the user operation with
 * @param {string} maciPubKey - The MACI public key to sign the user operation with
 * @param {string} sgData - The SG data to sign the user operation with
 * @returns {Promise<{stateIndex: bigint, voiceCreditBalance: bigint}>} The state index and voice credit balance
 */
export const signup = async ({
  maciPubKey,
  maciAddress,
  sgData,
  // TODO: make this work with privy
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signer,
  smartAccount,
  smartAccountClient,
}: {
  maciPubKey: string;
  maciAddress: Address;
  sgData: string | undefined;
  signer: JsonRpcSigner | undefined;
  smartAccount: KernelAccount;
  smartAccountClient: KernelAccountClient<Transport, Chain>;
}): Promise<{ stateIndex: string; voiceCredits: number }> => {
  const pubKey = PubKey.deserialize(maciPubKey);
  const { request } = await publicClient.simulateContract({
    account: smartAccount,
    address: maciAddress,
    abi: MACIFactory.abi,
    functionName: "signUp",
    args: [
      {
        x: pubKey.rawPubKey[0],
        y: pubKey.rawPubKey[1],
      },
      sgData as Hex,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ],
  });
  const txHash = await smartAccountClient.writeContract(request);
  const txReceipt = await publicClient.getTransactionReceipt({
    hash: txHash,
  });

  const logs = parseEventLogs({
    abi: MACIFactory.abi,
    eventName: "SignUp",
    logs: txReceipt.logs,
  });

  if (!logs[0]) {
    throw new Error("Unexpected event logs");
  }

  return {
    // eslint-disable-next-line no-underscore-dangle
    stateIndex: logs[0].args._stateIndex.toString(),
    // eslint-disable-next-line no-underscore-dangle
    voiceCredits: Number(logs[0].args._voiceCreditBalance),
  };
};

/**
 * @notice copied from maci-cli/sdk to add sponsorship
 * Batch publish new messages to a MACI Poll contract
 * @param {IPublishBatchArgs} args - The arguments for the publish command
 * @returns {IPublishBatchData} The ephemeral private key used to encrypt the message, transaction hash
 */
export const publishBatch = async ({
  messages,
  maciAddress,
  publicKey,
  privateKey,
  pollId,
  signer,
  smartAccount,
  smartAccountClient,
}: ISmartAccountPublishBatchArgs): Promise<IPublishBatchData> => {
  if (!PubKey.isValidSerializedPubKey(publicKey)) {
    throw new Error("invalid MACI public key");
  }

  if (!PrivKey.isValidSerializedPrivKey(privateKey)) {
    throw new Error("invalid MACI private key");
  }

  if (pollId < 0n) {
    throw new Error(`invalid poll id ${pollId}`);
  }

  const userMaciPubKey = PubKey.deserialize(publicKey);
  const userMaciPrivKey = PrivKey.deserialize(privateKey);
  const maciContract = MACIFactory.connect(maciAddress, signer);
  const pollContracts = await maciContract.getPoll(pollId);

  const pollContract = PollFactory.connect(pollContracts.poll, signer);

  const [treeDepths, coordinatorPubKeyResult] = await Promise.all([
    pollContract.treeDepths(),
    pollContract.coordinatorPubKey(),
  ]);
  const maxVoteOptions = Number(BigInt(MESSAGE_TREE_ARITY) ** treeDepths.voteOptionTreeDepth);

  // validate the vote options index against the max leaf index on-chain
  messages.forEach(({ stateIndex, voteOptionIndex, nonce }) => {
    if (voteOptionIndex < 0 || maxVoteOptions < voteOptionIndex) {
      throw new Error("invalid vote option index");
    }

    // check < 1 cause index zero is a blank state leaf
    if (stateIndex < 1) {
      throw new Error("invalid state index");
    }

    if (nonce < 0) {
      throw new Error("invalid nonce");
    }
  });

  const coordinatorPubKey = new PubKey([
    BigInt(coordinatorPubKeyResult.x.toString()),
    BigInt(coordinatorPubKeyResult.y.toString()),
  ]);

  const encryptionKeypair = new Keypair();
  const sharedKey = Keypair.genEcdhSharedKey(encryptionKeypair.privKey, coordinatorPubKey);

  const payload: [IMessageContractParams, IG1ContractParams][] = messages.map(
    ({ salt, stateIndex, voteOptionIndex, newVoteWeight, nonce }) => {
      const userSalt = salt ? BigInt(salt) : genRandomSalt();

      // create the command object
      const command = new PCommand(
        stateIndex,
        userMaciPubKey,
        voteOptionIndex,
        newVoteWeight,
        nonce,
        BigInt(pollId),
        userSalt,
      );

      // sign the command with the user private key
      const signature = command.sign(userMaciPrivKey);

      const message = command.encrypt(signature, sharedKey);

      return [message.asContractParam(), encryptionKeypair.pubKey.asContractParam()];
    },
  );

  const preparedMessages = payload.map(([message]) => message);
  const preparedKeys = payload.map(([, key]) => key);

  const reversedMessages = preparedMessages.reverse().map((item) => ({
    data: item.data.map((val) => BigInt(val)) as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
    ],
  }));
  const reversedKeys = preparedKeys.reverse() as readonly {
    x: bigint;
    y: bigint;
  }[];

  const to = pollContracts.poll as Address;
  const calldata = encodeFunctionData({
    abi: PollFactory.abi,
    functionName: "publishMessageBatch",
    args: [reversedMessages, reversedKeys],
  });

  const userOpHash = await sendUserOperation(to, calldata, smartAccount, smartAccountClient);

  return {
    hash: userOpHash,
    encryptedMessages: preparedMessages,
    privateKey: encryptionKeypair.privKey.serialize(),
  };
};

/**
 * Send a user operation
 * @param to
 * @param calldata
 * @param smartAccount
 * @param smartAccountClient
 * @returns The user operation hash
 */
export default async function sendUserOperation(
  to: Hex,
  calldata: Hex,
  smartAccount: KernelAccount,
  smartAccountClient: KernelAccountClient<Transport, Chain>,
): Promise<string> {
  const userOpHash = await smartAccountClient.sendUserOperation({
    account: smartAccount,
    calls: [{ to, data: calldata, value: 0n }],
  });

  const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: 20000,
  });

  if (!userOpReceipt.success) {
    throw new Error(`User Operation reverted ${userOpHash}. ${userOpReceipt.reason ?? ""}`);
  }

  return userOpHash;
}
