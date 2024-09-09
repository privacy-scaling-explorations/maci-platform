// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MACI as BaseMACI } from "maci-contracts/contracts/MACI.sol";
import { IPollFactory } from "maci-contracts/contracts/interfaces/IPollFactory.sol";
import { IMessageProcessorFactory } from "maci-contracts/contracts/interfaces/IMPFactory.sol";
import { ITallyFactory } from "maci-contracts/contracts/interfaces/ITallyFactory.sol";
import { InitialVoiceCreditProxy } from "maci-contracts/contracts/initialVoiceCreditProxy/InitialVoiceCreditProxy.sol";
import { SignUpGatekeeper } from "maci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";

import { ICommon } from "../interfaces/ICommon.sol";
import { IPoll } from "../interfaces/IPoll.sol";
import { IRegistryManager } from "../interfaces/IRegistryManager.sol";

/// @title MACI - Minimum Anti-Collusion Infrastructure
/// @notice A contract which allows users to sign up, and deploy new polls
contract MACI is Ownable, BaseMACI, ICommon {
  /// @notice Registry manager
  IRegistryManager public registryManager;

  /// @notice Create a new instance of the MACI contract.
  /// @param pollFactory The PollFactory contract
  /// @param messageProcessorFactory The MessageProcessorFactory contract
  /// @param tallyFactory The TallyFactory contract
  /// @param signUpGatekeeper The SignUpGatekeeper contract
  /// @param initialVoiceCreditProxy The InitialVoiceCreditProxy contract
  /// @param stateTreeDepth The depth of the state tree
  /// @param emptyBallotRoots The roots of the empty ballot trees
  constructor(
    IPollFactory pollFactory,
    IMessageProcessorFactory messageProcessorFactory,
    ITallyFactory tallyFactory,
    SignUpGatekeeper signUpGatekeeper,
    InitialVoiceCreditProxy initialVoiceCreditProxy,
    uint8 stateTreeDepth,
    uint256[5] memory emptyBallotRoots
  )
    payable
    Ownable(msg.sender)
    BaseMACI(
      pollFactory,
      messageProcessorFactory,
      tallyFactory,
      signUpGatekeeper,
      initialVoiceCreditProxy,
      stateTreeDepth,
      emptyBallotRoots
    )
  {}

  /// @notice Initialize the poll by given poll id and transfer poll ownership to the caller.
  /// @param pollId The poll id
  function initPoll(uint256 pollId) public onlyOwner {
    PollContracts memory pollAddresses = polls[pollId];
    IPoll poll = IPoll(pollAddresses.poll);

    poll.init();
    poll.transferOwnership(msg.sender);
  }

  /// @notice Set RegistryManager for MACI
  /// @param pollId The poll id
  /// @param registryAddress The registry address
  function setPollRegistry(uint256 pollId, address registryAddress) public onlyOwner {
    PollContracts memory pollAddresses = polls[pollId];
    IPoll poll = IPoll(pollAddresses.poll);

    poll.setRegistry(registryAddress);
  }

  /// @notice Set RegistryManager for MACI
  /// @param registryManagerAddress Registry manager address
  function setRegistryManager(address registryManagerAddress) public onlyOwner {
    if (registryManagerAddress == address(0)) {
      revert InvalidAddress();
    }

    registryManager = IRegistryManager(registryManagerAddress);
  }
}
