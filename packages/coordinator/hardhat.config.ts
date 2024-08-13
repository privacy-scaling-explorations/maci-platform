/* eslint-disable @typescript-eslint/no-var-requires */
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/types";

import * as path from "path";

dotenv.config();

const parentDir = __dirname.includes("build") ? ".." : "";
const TEST_MNEMONIC = "test test test test test test test test test test test junk";

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: process.env.COORDINATOR_RPC_URL || "",
      accounts: {
        mnemonic: TEST_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
      loggingEnabled: false,
    },
    hardhat: {
      loggingEnabled: false,
    },
  },
  paths: {
    sources: path.resolve(__dirname, parentDir, "./node_modules/maci-contracts/contracts"),
    artifacts: path.resolve(__dirname, parentDir, "./node_modules/maci-contracts/build/artifacts"),
  },
};

export default config;
