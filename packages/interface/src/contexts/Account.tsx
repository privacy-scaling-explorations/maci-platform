import { useWallets, usePrivy } from "@privy-io/react-auth";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  KernelAccountClient,
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { useState, useEffect, useMemo, useCallback, createContext, ReactNode, useContext } from "react";
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

export type AccountType = "none" | "extension" | "embedded";

interface AccountContextType {
  accountType: AccountType;
  storeAccountType: (accountType: AccountType) => void;
  address: `0x${string}` | undefined;
  chain: Chain;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  account: KernelAccount | undefined;
  accountClient: KernelAccountClient<Transport, Chain> | undefined;
}

interface AccountProviderProps {
  children: ReactNode;
}

type Signer = OneOf<EIP1193Provider | WalletClient<Transport, Chain | undefined, Account> | LocalAccount>;
interface EntryPointType<entryPointVersion extends EntryPointVersion> {
  address: Address;
  version: entryPointVersion;
}

export type KernelAccount = Awaited<ReturnType<typeof createKernelAccount>>;

interface GetPaymasterDataParameters {
  sender: `0x${string}`;
  callData: Hex;
  callGasLimit?: bigint;
  factory?: `0x${string}` | undefined;
  factoryData?: `0x${string}` | undefined;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce: bigint;
  preVerificationGas?: bigint;
  verificationGasLimit?: bigint;
  chainId: number;
  entryPointAddress: `0x${string}`;
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

export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }: AccountProviderProps) => {
  const [accountType, setAccountType] = useState<AccountType>("none");
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [account, setAccount] = useState<KernelAccount>();
  const [accountClient, setAccountClient] = useState<KernelAccountClient<Transport, Chain>>();

  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  const wagmiAccount = wagmiUseAccount();

  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask"),
    [wallets],
  );

  useEffect(() => {
    const cachedAccountType = localStorage.getItem("accountType");
    if (
      cachedAccountType &&
      (cachedAccountType === "none" || cachedAccountType === "extension" || cachedAccountType === "embedded")
    ) {
      setAccountType(cachedAccountType);
    }
  }, []);

  const storeAccountType = (_accountType: AccountType) => {
    localStorage.setItem("accountType", _accountType);
    setAccountType(_accountType);
  };

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

  const value = useMemo(
    () => ({
      accountType,
      storeAccountType,
      address,
      chain,
      isConnected,
      isConnecting,
      isDisconnected,
      account,
      accountClient,
    }),
    [accountType, storeAccountType, address, chain, isConnected, isConnecting, isDisconnected, account, accountClient],
  );

  return <AccountContext.Provider value={value as AccountContextType}>{children}</AccountContext.Provider>;
};

export const useAccount = (): AccountContextType => {
  const accountContext = useContext(AccountContext);

  if (!accountContext) {
    throw new Error("Should use context inside provider.");
  }

  return accountContext;
};
