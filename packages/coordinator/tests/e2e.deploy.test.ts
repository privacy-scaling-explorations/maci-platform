// To only run this file: npx jest --testPathPattern=tests/e2e.deploy.test.ts

import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import dotenv from "dotenv";
import { type Signer } from "ethers";
import hardhat from "hardhat";
import { EGatekeepers, EInitialVoiceCreditProxies } from "maci-contracts";
import { Socket, io } from "socket.io-client";
import { Hex, parseEther, zeroAddress } from "viem";

import { before } from "node:test";

import { AppModule } from "../ts/app.module";
import { ESupportedNetworks } from "../ts/common";
import { IDeployMaciArgs } from "../ts/deployer/types";
import { FileModule } from "../ts/file/file.module";
import { IGenerateSessionKeyReturn } from "../ts/sessionKeys/types";

import { generateApproval, getAuthorizationHeader, getKernelAccount, replacer } from "./utils";

dotenv.config();

const LOCALHOST = "http://localhost:3000";

describe("E2E Deployment Tests", () => {
  let signer: Signer;
  let encryptedHeader: string;
  // TODO NICO: uncomment this let coordinatorKeypair: Keypair;
  let sessionKeyAddress: Hex;
  let approval: string;
  let app: INestApplication;
  let socket: Socket;

  // set up coordinator address
  beforeAll(async () => {
    [signer] = await hardhat.ethers.getSigners();
    encryptedHeader = await getAuthorizationHeader(signer);
    // TODO NICO: uncomment this coordinatorKeypair = new Keypair();
    process.env.COORDINATOR_ADDRESSES = await signer.getAddress();
  });

  // fund coordinator's smart contract wallet
  before(async () => {
    const sessionKeyAccount = await getKernelAccount(sessionKeyAddress);
    const tx = await signer.sendTransaction({
      to: sessionKeyAccount.address,
      value: parseEther("0.005"),
    });
    await tx.wait();
  });

  // set up NestJS app
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, FileModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    await app.listen(3000);
  });
  afterAll(async () => {
    await app.close();
  });

  // set up auth header in WS connection
  beforeEach(async () => {
    const authorization = await getAuthorizationHeader(signer);

    await new Promise((resolve) => {
      app.getUrl().then((url) => {
        socket = io(url, {
          extraHeaders: {
            authorization,
          },
        });
        socket.on("connect", () => {
          resolve(true);
        });
      });
    });
  });
  afterEach(() => {
    socket.disconnect();
  });

  // run tests
  test("should retrieve the session key address", async () => {
    const response = await fetch(`${LOCALHOST}/v1/session-keys/generate`, {
      method: "GET",
      headers: {
        Authorization: encryptedHeader,
      },
    });
    const body = (await response.json()) as IGenerateSessionKeyReturn;
    expect(response.status).toBe(200);
    expect(body.sessionKeyAddress).not.toBe(zeroAddress);

    // save them for future tests
    sessionKeyAddress = body.sessionKeyAddress;
    approval = await generateApproval(sessionKeyAddress);
  });

  test("should deploy MACI correctly", async () => {
    const response = await fetch(`${LOCALHOST}/v1/deploy/maci`, {
      method: "POST",
      headers: {
        Authorization: encryptedHeader,
        "Content-Type": "application/json",
      },
      // TODO NICO: we could use the testMaciDeploymentConfig object
      body: JSON.stringify(
        {
          approval,
          sessionKeyAddress,
          chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
          config: {
            gatekeeper: {
              type: EGatekeepers.FreeForAll,
            },
            initialVoiceCreditsProxy: {
              type: EInitialVoiceCreditProxies.Constant,
              args: {
                amount: "100",
              },
            },
            MACI: {
              stateTreeDepth: 4,
              gatekeeper: EGatekeepers.FreeForAll,
            },
            VkRegistry: {
              args: {
                stateTreeDepth: BigInt(4),
                intStateTreeDepth: BigInt(2),
                messageTreeDepth: BigInt(2),
                voteOptionTreeDepth: BigInt(2),
                messageBatchDepth: BigInt(2),
              },
            },
          },
        } as IDeployMaciArgs,
        replacer,
      ),
    });

    expect(response.status).toBe(201);
    // TODO: check MACI address is valid
    // TODO: should we check that subgraph is working?
  });
});
