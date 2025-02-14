import { usePrivy, useWallets } from "@privy-io/react-auth";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  KernelAccountClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Account,
  Address,
  Chain,
  createPublicClient,
  EIP1193Provider,
  Hex,
  http,
  LocalAccount,
  OneOf,
  Transport,
  WalletClient,
} from "viem";
import { entryPoint07Address, EntryPointVersion } from "viem/account-abstraction";
import { useAccount as wagmiUseAccount } from "wagmi";

import { config, getBundlerURL, getPaymasterURL } from "~/config";
import { useAccountType } from "~/contexts/AccountType";

type Signer = OneOf<EIP1193Provider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
interface EntryPointType<entryPointVersion extends EntryPointVersion> {
  address: Address;
  version: entryPointVersion;
}

export type KernelAccount = Awaited<ReturnType<typeof createKernelAccount>>;

interface GetPaymasterDataParameters {
  callData: Hex;
  callGasLimit?: bigint;
  factory?: `0x${string}` | undefined;
  factoryData?: `0x${string}` | undefined;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce: bigint;
  preVerificationGas?: bigint;
  verificationGasLimit?: bigint;
}

export const entryPoint: EntryPointType<"0.7"> = {
  address: entryPoint07Address,
  version: "0.7",
};
const kernelVersion = KERNEL_V3_1;
const chain = config.network;

// a public client to interact with the chain
export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
  chain,
});

export const createAccount = async (signer: Signer): Promise<ReturnType<typeof createKernelAccount>> => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  return createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });
};

export const createAccountClient = (account: KernelAccount | undefined): KernelAccountClient<Transport, Chain> =>
  createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(getBundlerURL()),
    paymaster: {
      getPaymasterData(getPaymasterDataParameters: GetPaymasterDataParameters) {
        const zeroDevPaymaster = createZeroDevPaymasterClient({
          chain,
          transport: http(getPaymasterURL()),
        });
        return zeroDevPaymaster.sponsorUserOperation({
          userOperation: getPaymasterDataParameters,
        });
      },
    },
  });

const useAccount = (): {
  address: `0x${string}` | undefined;
  chain: Chain;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  account: KernelAccount | undefined;
  accountClient: KernelAccountClient<Transport, Chain> | undefined;
} => {
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [account, setAccount] = useState<KernelAccount>();
  const [accountClient, setAccountClient] = useState<KernelAccountClient<Transport, Chain>>();

  const { accountType } = useAccountType();
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  const wagmiAccount = wagmiUseAccount();

  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask"),
    [wallets],
  );

  const setupPrivyAccount = useCallback(async () => {
    if (!authenticated || !wallet) {
      setIsConnected(false);
      setIsConnecting(false);
      setIsDisconnected(true);
      return;
    }

    try {
      setIsConnecting(true);
      const provider = await wallet.getEthereumProvider();
      // const signer = await providerToSmartAccountSigner(provider as EIP1193Provider);
      const smartAccount = await createAccount(provider as EIP1193Provider);
      const smartAccountClient = createAccountClient(smartAccount);

      setAddress(smartAccount.address);
      setIsConnected(true);
      setIsDisconnected(false);
      setAccount(smartAccount);
      setAccountClient(smartAccountClient);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error setting up Privy account:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [authenticated, wallet]);

  useEffect(() => {
    if (accountType === "none") {
      // eslint-disable-next-line no-console
      console.log("accountType is none");
      return;
    }

    if (accountType === "extension") {
      // eslint-disable-next-line no-console
      console.log("accountType is extension");
      setAddress(wagmiAccount.address);
      setIsConnected(wagmiAccount.isConnected);
      setIsConnecting(wagmiAccount.isConnecting);
      setIsDisconnected(wagmiAccount.isDisconnected);
      return;
    }

    if (!isConnected && !isConnecting) {
      // eslint-disable-next-line no-console
      console.log("accountType is embedded");
      setupPrivyAccount();
    }
  }, [
    accountType,
    authenticated,
    wallet,
    wagmiAccount.address,
    wagmiAccount.isConnected,
    wagmiAccount.isConnecting,
    wagmiAccount.isDisconnected,
    isConnected,
    isConnecting,
    setupPrivyAccount,
  ]);

  return {
    address,
    chain,
    isConnected,
    isConnecting,
    isDisconnected,
    account,
    accountClient,
  };
};

export default useAccount;
