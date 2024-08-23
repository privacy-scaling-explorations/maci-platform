// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ICommon
/// @notice Interface that contains common things for all the contracts
interface ICommon {
  /// @notice custom errors
  error InvalidAddress();
  error InvalidInput();
  error InvalidIndex();
  error ValidationError();
}
