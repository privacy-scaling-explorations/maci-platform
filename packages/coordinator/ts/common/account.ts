import { createPublicClient, http, HttpTransport, Transport } from "viem";
import { genPimlicoRPCUrl } from "./pimlico";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { privateKeyToAccount } from "viem/accounts";
import { deserializePermissionAccount } from "@zerodev/permissions";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { createKernelAccountClient, KernelAccountClient, KernelSmartAccount } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";

/**
 * Get a Kernel account handle given a session key
 * @param sessionKey
 * @param chainId
 */
export const getKernelClient = async (
  sessionKey: `0x${string}`,
  approval: string,
  chainId: string,
): Promise<
  KernelAccountClient<
    ENTRYPOINT_ADDRESS_V07_TYPE,
    Transport,
    undefined,
    KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, undefined>
  >
> => {
  const bundlerUrl = genPimlicoRPCUrl(chainId);
  const publicClient = createPublicClient({
    transport: http(bundlerUrl),
  });

  // Using a stored private key
  const sessionKeySigner = toECDSASigner({
    signer: privateKeyToAccount(sessionKey),
  });

  const sessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    ENTRYPOINT_ADDRESS_V07,
    KERNEL_V3_1,
    approval,
    sessionKeySigner,
  );

  const kernelClient = createKernelAccountClient({
    bundlerTransport: http(bundlerUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    account: sessionKeyAccount,
  });

  return kernelClient;
};
