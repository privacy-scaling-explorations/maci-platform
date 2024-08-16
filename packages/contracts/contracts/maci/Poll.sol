// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Poll as BasePoll } from "maci-contracts/contracts/Poll.sol";

/// @title Poll
/// @notice A Poll contract allows voters to submit encrypted messages
/// which can be either votes or key change messages.
/// @dev Do not deploy this directly. Use PollFactory.deploy() which performs some
/// checks on the Poll constructor arguments.
contract Poll is Ownable, BasePoll {
  /// @notice Each MACI instance can have multiple Polls.
  /// When a Poll is deployed, its voting period starts immediately.
  /// @param duration The duration of the voting period, in seconds
  /// @param treeDepths The depths of the merkle trees
  /// @param coordinatorPubKey The coordinator's public key
  /// @param extContracts The external contracts
  constructor(
    uint256 duration,
    TreeDepths memory treeDepths,
    PubKey memory coordinatorPubKey,
    ExtContracts memory extContracts,
    uint256 emptyBallotRoot
  )
    payable
    Ownable(address(extContracts.maci))
    BasePoll(duration, treeDepths, coordinatorPubKey, extContracts, emptyBallotRoot)
  {}

  /// @notice The initialization function.
  function init() public override onlyOwner {
    super.init();
  }
}
