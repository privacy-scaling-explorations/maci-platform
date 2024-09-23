// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseRegistry } from "./BaseRegistry.sol";

contract SimpleRegistry is BaseRegistry {
  /// @notice Create a new instance of the registry contract
  /// @param max The maximum number of projects that can be registered
  /// @param url The metadata url
  /// @param ownerAddress The owner address
  constructor(
    uint256 max,
    string memory url,
    address ownerAddress
  ) payable BaseRegistry(max, url, ownerAddress) {}
}
