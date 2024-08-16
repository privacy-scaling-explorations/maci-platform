// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPoll as IPollBase } from "maci-contracts/contracts/interfaces/IPoll.sol";

import { IOwnable } from "./IOwnable.sol";

/// @title IPollBase
/// @notice Poll interface
interface IPoll is IPollBase, IOwnable {
  /// @notice The initialization function.
  function init() external;
}
