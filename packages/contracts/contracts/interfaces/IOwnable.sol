// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IOwnable
/// @notice Ownable interface
interface IOwnable {
  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Can only be called by the current owner.
   */
  function transferOwnership(address newOwner) external;

  /**
   * @dev Leaves the contract without owner. It will not be possible to call
   * `onlyOwner` functions. Can only be called by the current owner.
   *
   * NOTE: Renouncing ownership will leave the contract without an owner,
   * thereby disabling any functionality that is only available to the owner.
   */
  function renounceOwnership() external;

  /**
   * @dev Returns the address of the current owner.
   */
  function owner() external view returns (address);
}
