/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, HttpException, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AccountSignatureGuard, Public } from "../auth/AccountSignatureGuard.service";

import { DeployerService } from "./deployer.service";
import { DeployerServiceDeployMaciDto } from "./dto";

@ApiTags("v1/deploy")
@ApiBearerAuth()
@Controller("v1/deploy")
@UseGuards(AccountSignatureGuard)
export class DeployerController {
  /**
   * Logger
   */
  private readonly logger = new Logger(DeployerController.name);

  /**
   * Initialize DeployerController
   *
   * @param deployerService - proof generator service
   */
  constructor(private readonly deployerService: DeployerService) {}

  /**
   * Deploy MACI Contracts
   *
   * @returns MACI contract address
   */
  @ApiBody({ type: DeployerServiceDeployMaciDto })
  @ApiResponse({ status: HttpStatus.OK, description: "Public key was successfully returned" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" })
  @Post("deploy/maci")
  async deployMaci(@Body() args: DeployerServiceDeployMaciDto): Promise<void> {
    return this.deployerService.deployMaci(args).catch((error: Error) => {
      this.logger.error(`Error:`, error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    });
  }

  // /**
  //  * Deploy Poll
  //  *
  //  * @returns Success or failure
  //  */
  // async deployPoll(@Body() args: DeployerServiceDto): Promise<void> {
  //   return this.deployerService.deployPoll(args).catch((error: Error) => {
  //     this.logger.error(`Error:`, error);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   });
  // }
}
