// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { TallyFactory as BaseTallyFactory } from "maci-contracts/contracts/TallyFactory.sol";

import { Tally } from "./Tally.sol";

/// @title TallyFactory
/// @notice A factory contract which deploys Tally contracts.
contract TallyFactory is BaseTallyFactory {
  /// @inheritdoc BaseTallyFactory
  function deploy(
    address verifier,
    address vkRegistry,
    address poll,
    address messageProcessor,
    address owner,
    Mode mode
  ) public virtual override returns (address tallyAddress) {
    // deploy Tally for this Poll
    Tally tally = new Tally(verifier, vkRegistry, poll, messageProcessor, owner, mode);
    tallyAddress = address(tally);
  }
}
