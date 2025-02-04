import { Test } from "@nestjs/testing";
import { zeroAddress } from "viem";

import { ErrorCodes, ESupportedNetworks } from "../../common";
import { FileService } from "../../file/file.service";
import { SessionKeysService } from "../../sessionKeys/sessionKeys.service";
import { DeployerController } from "../deployer.controller";
import { DeployerService } from "../deployer.service";

import { testMaciDeploymentConfig, testPollDeploymentConfig } from "./utils";

describe("DeployerController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let deployerController: DeployerController;

  const mockDeployerService = {
    deployMaci: jest.fn(),
    deployPoll: jest.fn(),
  };

  const defaultDeployMaciReturn: string = zeroAddress;
  const defaultDeployPollReturn = "0";

  const deployerControllerFail = new DeployerController(
    new DeployerService(new SessionKeysService(new FileService()), new FileService()),
  );

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [DeployerController],
    })
      .useMocker((token) => {
        if (token === DeployerService) {
          mockDeployerService.deployMaci.mockResolvedValue(defaultDeployMaciReturn);
          mockDeployerService.deployPoll.mockResolvedValue(defaultDeployPollReturn);
          return mockDeployerService;
        }

        return jest.fn();
      })
      .compile();

    deployerController = app.get<DeployerController>(DeployerController);
  });

  describe("v1/deploy/maci", () => {
    test("should deploy all contract", async () => {
      const response = await deployerController.deployMACIContracts({
        chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
        approval: "",
        sessionKeyAddress: "0x",
        config: testMaciDeploymentConfig,
      });

      expect(response).toEqual(defaultDeployMaciReturn);
    });

    test("should return 400 bad request when the service throws", async () => {
      await expect(
        deployerControllerFail.deployMACIContracts({
          chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
          approval: "",
          sessionKeyAddress: "0x",
          config: testMaciDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.SESSION_KEY_NOT_FOUND.toString());
    });
  });

  describe("v1/deploy/poll", () => {
    test("should deploy a new poll", async () => {
      const response = await deployerController.deployPoll({
        chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
        approval: "",
        sessionKeyAddress: "0x",
        config: testPollDeploymentConfig,
      });

      expect(response).toEqual(defaultDeployPollReturn);
    });

    test("should return 400 bad request when the service throws", async () => {
      await expect(
        deployerControllerFail.deployPoll({
          chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
          approval: "",
          sessionKeyAddress: "0x",
          config: testPollDeploymentConfig,
        }),
      ).rejects.toThrow(ErrorCodes.MACI_NOT_DEPLOYED.toString());
    });
  });
});
