import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

import type { IDeployMaciConfig, IDeployPollConfig } from "./types";

/**
 * Data transfer object for MACI contracts deployment
 */
export class DeployerServiceDeployMaciDto {
  /**
   * Session Key Approval string
   */
  @ApiProperty({
    description: "Session Key Approval string",
    type: String,
  })
  @IsString()
  approval!: string;

  /**
   * Address of the session key
   */
  @ApiProperty({
    description: "Address of the session key",
    type: String,
  })
  @IsString()
  sessionKeyAddress!: `0x${string}`;

  /**
   * Chain Id
   */
  @ApiProperty({
    description: "Chain Id to which to deploy the contract(s)",
    type: String,
  })
  @IsString()
  chainId!: string;

  /**
   * Config
   */
  @ApiProperty({
    description: "Deployment configuration",
    type: Object,
  })
  config!: IDeployMaciConfig;
}

/**
 * Data transfer object for Poll contract deployment
 */
export class DeployerServiceDeployPollDto {
  /**
   * Session Key Approval string
   */
  @ApiProperty({
    description: "Session Key Approval string",
    type: String,
  })
  @IsString()
  approval!: string;

  /**
   * Address of the session key
   */
  @ApiProperty({
    description: "Address of the session key",
    type: String,
  })
  @IsString()
  sessionKeyAddress!: `0x${string}`;

  /**
   * Chain Id
   */
  @ApiProperty({
    description: "Chain Id to which to deploy the contract(s)",
    type: String,
  })
  @IsString()
  chainId!: string;

  /**
   * Config
   */
  @ApiProperty({
    description: "Deployment configuration",
    type: Object,
  })
  config!: IDeployPollConfig;
}
