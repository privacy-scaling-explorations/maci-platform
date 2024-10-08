// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Poll as BasePoll } from "maci-contracts/contracts/Poll.sol";

import { ICommon } from "../interfaces/ICommon.sol";
import { IRecipientRegistry } from "../interfaces/IRecipientRegistry.sol";

/// @title Poll
/// @notice A Poll contract allows voters to submit encrypted messages
/// which can be either votes or key change messages.
/// @dev Do not deploy this directly. Use PollFactory.deploy() which performs some
/// checks on the Poll constructor arguments.
contract Poll is Ownable, BasePoll, ICommon {
  /// @notice Poll specific registry
  address public registry;

  /// @notice The timestamp of the block at which the Poll was deployed
  uint256 public initTime;

  /// @notice events
  event SetRegistry(address indexed registry);
  event PollInit();

  /// @notice custom errors
  error RegistryAlreadyInitialized();
  error RegistryNotInitialized();
  error PollNotInitialized();

  /// @notice Each MACI instance can have multiple Polls.
  /// When a Poll is deployed, its voting period starts immediately.
  /// @param duration The duration of the voting period, in seconds
  /// @param treeDepths The depths of the merkle trees
  /// @param coordinatorPubKey The coordinator's public key
  /// @param extContracts The external contracts
  /// @param emptyBallotRoot The empty ballot root
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

  /// @notice Check if poll is initialized
  modifier isPollInitialized() {
    if (!isInit) {
      revert PollNotInitialized();
    }

    _;
  }

  /// @notice Check if registry is initialized
  modifier isRegistryInitialized() {
    if (address(registry) == address(0)) {
      revert RegistryNotInitialized();
    }

    _;
  }

  /// @notice Check if registry is valid and not initialized
  /// @param registryAddress Registry address
  modifier isRegistryNotInitialized(address registryAddress) {
    if (registryAddress == address(0)) {
      revert InvalidAddress();
    }

    if (address(registry) != address(0)) {
      revert RegistryAlreadyInitialized();
    }

    _;
  }

  /// @notice A modifier that causes the function to revert if the voting period is
  /// not over.
  modifier isAfterVotingDeadline() override {
    uint256 secondsPassed = block.timestamp - initTime;

    if (secondsPassed <= duration) {
      revert VotingPeriodNotOver();
    }

    _;
  }

  /// @notice A modifier that causes the function to revert if the voting period is over
  modifier isWithinVotingDeadline() override {
    uint256 secondsPassed = block.timestamp - initTime;

    if (secondsPassed >= duration) {
      revert VotingPeriodOver();
    }

    _;
  }

  /// @notice Set poll registry.
  /// @param registryAddress The registry address
  function setRegistry(address registryAddress) public onlyOwner isRegistryNotInitialized(registryAddress) {
    registry = registryAddress;

    emit SetRegistry(registryAddress);
  }

  /// @notice Get the poll registry.
  /// @return registry The poll registry
  function getRegistry() public view returns (IRecipientRegistry) {
    return IRecipientRegistry(registry);
  }

  /// @notice The initialization function.
  function init() public override onlyOwner isRegistryInitialized {
    initTime = block.timestamp;
    super.init();

    emit PollInit();
  }

  /// @inheritdoc BasePoll
  function getDeployTimeAndDuration() public view override returns (uint256 pollDeployTime, uint256 pollDuration) {
    pollDeployTime = initTime;
    pollDuration = duration;
  }

  /// @inheritdoc BasePoll
  function publishMessage(
    Message memory message,
    PubKey calldata encPubKey
  ) public override isPollInitialized isWithinVotingDeadline {
    super.publishMessage(message, encPubKey);
  }
}
