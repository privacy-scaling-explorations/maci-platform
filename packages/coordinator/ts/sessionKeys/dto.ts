import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsEthereumAddress } from "class-validator";

import type { Hex } from "viem";

import { ESupportedNetworks, transformToString } from "../common";

/**
 * Data transfer object for Deactivate session key
 */
export class DeactivateSessionKeyDto {
  /**
   * Session key address
   */
  @ApiProperty({
    description: "Session key address",
    type: String,
  })
  @IsEthereumAddress()
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
}
