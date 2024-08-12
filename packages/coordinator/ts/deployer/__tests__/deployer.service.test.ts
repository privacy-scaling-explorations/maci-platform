import dotenv from "dotenv";

import fs from "fs";

import { ErrorCodes } from "../../common";
import { DeployerService } from "../deployer.service";
import { getSimpleAccountClient, getWalletClient } from "./utils";
import { FreeForAllGatekeeper__factory } from "maci-contracts";

dotenv.config();

describe("DeployerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should deploy maci contracts", async () => {
    // get a client
    const client = await getSimpleAccountClient();
    
    // encode the deploy calldata
    const deployCalldata = await client.encodeDeployCallData({
      abi: FreeForAllGatekeeper__factory.abi,
      args: [],
      bytecode: FreeForAllGatekeeper__factory.bytecode,
    })

    
  });
});
