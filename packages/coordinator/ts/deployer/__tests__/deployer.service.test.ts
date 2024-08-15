import dotenv from "dotenv";

import { DeployerService } from "../deployer.service";
import { CryptoService } from "../../crypto/crypto.service";
import { FileService } from "../../file/file.service";
import { ZeroAddress } from "ethers";
import { IDeployMaciConfig } from "../types";
import { getKernelClient } from "../../common/account";
import { optimismSepolia } from "viem/chains";
import { createTestAccount, getDeployedContractAddress, getPublicClient } from "./utils";
import { FreeForAllGatekeeper__factory } from "maci-contracts";
import { decodeEventLog } from "viem";

dotenv.config();

describe("DeployerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const cryptoService = new CryptoService();
  const fileService = new FileService();
  const deployerService = new DeployerService(cryptoService, fileService);

  test("should generate and store a session key", () => {
    const sessionKeyAddress = deployerService.generateSessionKey();
    expect(sessionKeyAddress).toBeDefined();
    expect(sessionKeyAddress).not.toEqual(ZeroAddress);

    const sessionKey = fileService.getSessionKey(sessionKeyAddress);
    expect(sessionKey).toBeDefined();
  });

  test("should delete a session key", () => {
    const sessionKeyAddress = deployerService.generateSessionKey();
    expect(sessionKeyAddress).toBeDefined();
    expect(sessionKeyAddress).not.toEqual(ZeroAddress);

    const sessionKey = fileService.getSessionKey(sessionKeyAddress);
    expect(sessionKey).toBeDefined();

    deployerService.deactivateSessionKey(sessionKeyAddress);
    const sessionKeyDeleted = fileService.getSessionKey(sessionKeyAddress);
    expect(sessionKeyDeleted).toBeUndefined();
  });

  test("should deploy maci contracts", async () => {
    const config: IDeployMaciConfig = {
      FreeForAllGatekeeper: {
        deploy: true,
      },
      ConstantInitialVoiceCreditProxy: {
        deploy: true,
        amount: 100,
      },
      VkRegistry: {
        deploy: false,
      },
      MACI: {
        stateTreeDepth: 10,
        gatekeeper: "FreeForAllGatekeeper",
      },
    };

    await deployerService.deployMaci({
      approval: "",
      sessionKeyAddress: "0x",
      chainId: optimismSepolia.id.toString(),
      config
    })


    // const publicClient = getPublicClient(process.env.COORDINATOR_RPC_URL!, optimismSepolia);
    // const sessionKeyAddress = deployerService.generateSessionKey();
    // const sessionKey = fileService.getSessionKey(sessionKeyAddress);
    // const client = await createTestAccount();

    // const tx = await client.deployContract({
    //   bytecode: FreeForAllGatekeeper__factory.bytecode,
    //   abi: FreeForAllGatekeeper__factory.abi,
    //   // @ts-ignore
    //   account: client.account
    // })

    // const receipt = await publicClient.waitForTransactionReceipt({
    //   hash: tx,
    // });

    // const addr = getDeployedContractAddress(receipt)

    // console.log("deployedAddress", addr);
  });
});
