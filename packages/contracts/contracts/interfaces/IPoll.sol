// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPoll as IPollBase } from "maci-contracts/contracts/interfaces/IPoll.sol";

import { IOwnable } from "./IOwnable.sol";
import { IRecipientRegistry } from "./IRecipientRegistry.sol";

/// @title IPoll
/// @notice Poll interface
interface IPoll is IPollBase, IOwnable {
  /// @notice The initialization function.
  function init() external;

  /// @notice Set the poll registry.
  /// @param registryAddress The registry address
  function setRegistry(address registryAddress) external;

  /// @notice Get the poll registry.
  /// @return registry The poll registry
  function getRegistry() external returns (IRecipientRegistry);
}
