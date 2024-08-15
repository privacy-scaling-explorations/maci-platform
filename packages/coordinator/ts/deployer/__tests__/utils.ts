import { Chain, createPublicClient, createWalletClient, http, TransactionReceipt } from "viem";
import { generatePrivateKey, mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import { hardhat, optimismSepolia } from "viem/chains";
import { ENTRYPOINT_ADDRESS_V07, getRequiredPrefund } from "permissionless";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { genPimlicoRPCUrl } from "../../common/pimlico";
import { SmartAccount } from "permissionless/accounts";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { getDefaultSigner } from "maci-contracts";

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const kernelVersion = KERNEL_V3_1;

const hardhatRpc = "http://localhost:8545";
const rpcUrl = process.env.COORDINATOR_RPC_URL!;
// const bundlerRpc = genPimlicoRPCUrl(optimismSepolia.id.toString())
const bundlerRpc = "https://rpc.zerodev.app/api/v2/bundler/f1cb192e-7962-4d12-8b70-bb2f7781d5a5";

export const getWalletClient = () =>
  createWalletClient({
    account: mnemonicToAccount("test test test test test test test test test test test junk"),
    chain: hardhat,
    transport: http(hardhatRpc),
  });

export const getPublicClient = (rpc: string, chain: Chain) => {
  const transport = http(rpc);

  return createPublicClient({
    chain: chain,
    transport,
    pollingInterval: 100,
  });
};

export const getMockASessionKeyApproval = (sessionKeyAddress: `0x${string}`) => {
  // const sessionKey =
};

/**
 * Fund the test smart account
 * @param address - The address to fund
 * @param amount - The amount to fund
 */
export const fundTestAccount = async (address: `0x${string}`): Promise<void> => {
  const signer = await getDefaultSigner();
  await signer.sendTransaction({
    to: address,
    value: 3n * 10n ** 15n,
  });
};

/**
 * Creates a test account on the given chain
 */
export const createTestAccount = async () => {
  const privateKey = process.env.TEST_PRIVATE_KEY!;

  const publicClient = getPublicClient(bundlerRpc, optimismSepolia);

  const signer = privateKeyToAccount(privateKey as `0x${string}`);

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
  });

  const kernelClient = createKernelAccountClient({
    account,
    entryPoint,
    bundlerTransport: http(bundlerRpc),
    chain: optimismSepolia,
  });

  // await fundTestAccount(kernelClient.account.address)

  return kernelClient;
};


export const contractCreationEventTopic = "0x4db17dd5e4732fb6da34a148104a592783ca119a1e7bb8829eba6cbadef0b511"
/**
 * Get the address of the newly deployed contract from a transaction receipt
 * @param receipt - The transaction receipt
 * @returns The address of the newly deployed contract
 */
export const getDeployedContractAddress = (
  receipt: TransactionReceipt
): string | undefined => {

  const addr = receipt.logs.find(
    (log) => log.topics[0] === contractCreationEventTopic,
  );

  const deployedAddress = addr ? "0x" + addr.topics[1]?.slice(26) : undefined;

  return deployedAddress
}
