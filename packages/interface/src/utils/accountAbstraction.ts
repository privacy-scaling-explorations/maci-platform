import { useWallets } from "@privy-io/react-auth";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  KernelAccountClient,
  KernelSmartAccount,
} from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import {
  IPublishBatchArgs,
  IPublishBatchData,
  PubKey,
  MACI__factory as MACIFactory,
  Poll__factory as PollFactory,
} from "maci-cli/sdk";
import { genRandomSalt } from "maci-crypto";
import { IG1ContractParams, IMessageContractParams, Keypair, PCommand, PrivKey } from "maci-domainobjs";
import {
  UserOperation,
  EstimateUserOperationGasParameters,
  ENTRYPOINT_ADDRESS_V07,
  SmartAccountClient,
  providerToSmartAccountSigner,
} from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  Hex,
  http,
  parseEventLogs,
  Address,
  HttpTransport,
  Chain,
  encodeFunctionData,
  EIP1193Provider,
} from "viem";
import { optimismSepolia } from "viem/chains";

import { getPimlicoRPCURL, config } from "~/config";

const MESSAGE_TREE_ARITY = 5;

interface ISmartAccountPublishBatchArgs extends IPublishBatchArgs {
  smartAccount: KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>;
  smartAccountClient: SmartAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>;
}

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const kernelVersion = KERNEL_V3_1;

// a public client to interact with the chain
export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
  chain: optimismSepolia,
});

// a bundler client to interact with the bundler
export const pimlicoBundlerClient = createPimlicoBundlerClient({
  chain: config.network,
  transport: http(getPimlicoRPCURL()),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

/**
 * Modified signup function from maci-cli/sdk to signup user to MACI contract
 * @param {KernelEcdsaSmartAccount<EntryPoint, HttpTransport, Chain>} smartAccount - The smart account to sign the user operation with
 * @param {SmartAccountClient<EntryPoint, HttpTransport, Chain>} smartAccountClient - The smart account client to send the user operation with
 * @param {string} maciPubKey - The MACI public key to sign the user operation with
 * @param {string} sgData - The SG data to sign the user operation with
 * @returns {Promise<{stateIndex: bigint, voiceCreditBalance: bigint}>} The state index and voice credit balance
 */
export const signup = async (
  smartAccount: KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>,
  smartAccountClient: SmartAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>,
  maciPubKey: string,
  sgData: string,
): Promise<{ stateIndex: bigint; voiceCredits: bigint }> => {
  const pubKey = PubKey.deserialize(maciPubKey);
  const { request } = await publicClient.simulateContract({
    account: smartAccount,
    address: config.maciAddress! as Address,
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
    stateIndex: logs[0].args._stateIndex,
    // eslint-disable-next-line no-underscore-dangle
    voiceCredits: logs[0].args._voiceCreditBalance,
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
  pollId,
  maciAddress,
  publicKey,
  privateKey,
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
 * @returns
 */
export default async function sendUserOperation(
  to: Address,
  calldata: Hex,
  smartAccount: KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>,
  smartAccountClient: SmartAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>,
): Promise<string> {
  const estimateGasFees = await publicClient.estimateFeesPerGas();

  const partialUserOperation: UserOperation<"v0.7"> = {
    sender: smartAccount.address,
    nonce: await smartAccount.getNonce(),
    callData: await smartAccount.encodeCallData({
      to,
      value: 0n,
      data: calldata,
    }),
    callGasLimit: 0n,
    verificationGasLimit: 0n,
    preVerificationGas: 0n,
    maxFeePerGas: estimateGasFees.maxFeePerGas,
    maxPriorityFeePerGas: estimateGasFees.maxPriorityFeePerGas,
    signature: "0x",
  };

  const dummySignature = await smartAccount.getDummySignature(partialUserOperation);

  const estimateGasUserOperation: EstimateUserOperationGasParameters<ENTRYPOINT_ADDRESS_V07_TYPE> = {
    userOperation: {
      ...partialUserOperation,
      signature: dummySignature,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  };
  const gasValues = await pimlicoBundlerClient.estimateUserOperationGas(estimateGasUserOperation);

  // estimateUserOperationGas fails to accurately estimate the callGasLimit when sending a
  // userOp with calldata over a certain size. Adding a buffer ensures the userOp succeeds
  // in this case
  const multiplier = 10n; // 10%
  const callGasLimitBuffer = (gasValues.callGasLimit / 100n) * multiplier;

  const userOpHash = await smartAccountClient.sendUserOperation({
    account: smartAccount,
    userOperation: {
      ...partialUserOperation,
      callGasLimit: gasValues.callGasLimit + callGasLimitBuffer,
      verificationGasLimit: gasValues.verificationGasLimit,
      preVerificationGas: gasValues.preVerificationGas,
    },
  });

  const userOpReceipt = await pimlicoBundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: 20000,
  });

  if (!userOpReceipt.success) {
    throw new Error(`User Operation reverted ${userOpHash}. ${userOpReceipt.reason ?? ""}`);
  }

  return userOpHash;
}

/**
 * Hook to manage the smart account
 * @returns The smart account, smart account client, address, and is connected state
 */
export const useSmartAccount = (): {
  address: Address | undefined;
  isConnected: boolean;
  smartAccount: KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain> | undefined;
  smartAccountClient: KernelAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain> | undefined;
  setIsConnected: (isConnected: boolean) => void;
} => {
  const [address, setAddress] = useState<Address>();
  const [isConnected, setIsConnected] = useState(false);
  const [smartAccount, setSmartAccount] =
    useState<KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>>();
  const [smartAccountClient, setSmartAccountClient] =
    useState<KernelAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>>();

  const { wallets } = useWallets();

  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask"),
    [wallets],
  );
  useEffect(() => {
    const getSmartAccount = async () => {
      if (!wallet) {
        return;
      }
      const provider = await wallet.getEthereumProvider();
      const smartAccountSigner = await providerToSmartAccountSigner(provider as unknown as EIP1193Provider);

      // Create a ZeroDev ECDSA validator from the `smartAccountSigner` from above and your `publicClient`
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint,
        kernelVersion,
      });

      // Create a Kernel account from the ECDSA validator
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion,
      });

      // Create a Kernel account client to send user operations from the smart account
      const kernelClient = createKernelAccountClient({
        // @ts-expect-error type mismatch
        account,
        chain: config.network,
        entryPoint,
        bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
        middleware: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          sponsorUserOperation: async ({ userOperation }) => {
            const zerodevPaymaster = createZeroDevPaymasterClient({
              chain: config.network,
              entryPoint,
              transport: http(process.env.NEXT_PUBLIC_PAYMASTER_RPC),
            });
            return zerodevPaymaster.sponsorUserOperation({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              userOperation,
              entryPoint,
            });
          },
        },
      });

      setAddress(account.address);
      setIsConnected(true);
      // @ts-expect-error type mismatch
      setSmartAccount(account);
      // @ts-expect-error type mismatch
      setSmartAccountClient(kernelClient);
    };

    getSmartAccount();
  }, [wallets, wallet]);

  return {
    address,
    isConnected,
    smartAccount,
    smartAccountClient,
    setIsConnected,
  };
};
