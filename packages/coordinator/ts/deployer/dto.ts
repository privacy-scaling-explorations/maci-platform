import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsString } from "class-validator";

import type { IDeployMaciConfig, IDeployPollConfig } from "./types";
import type { Hex } from "viem";

import { ESupportedNetworks } from "../common";

export const transformToString = ({ value }: { value: string }): string => value.toLowerCase();

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
  sessionKeyAddress!: Hex;

  /**
   * Chain Name
   */
  @ApiProperty({
    description: "Chain to which to deploy the contract(s)",
    enum: ESupportedNetworks,
  })
  @IsEnum(ESupportedNetworks)
  @Transform(transformToString)
  chain!: ESupportedNetworks;

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
  sessionKeyAddress!: Hex;

  /**
   * Chain Name
   */
  @ApiProperty({
    description: "Chain to which to deploy the contract(s)",
    enum: ESupportedNetworks,
  })
  @IsEnum(ESupportedNetworks)
  @Transform(transformToString)
  chain!: ESupportedNetworks;

  /**
   * Config
   */
  @ApiProperty({
    description: "Deployment configuration",
    type: Object,
  })
  config!: IDeployPollConfig;
}
