// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { PollFactory as BasePollFactory } from "maci-contracts/contracts/PollFactory.sol";
import { IMACI } from "maci-contracts/contracts/interfaces/IMACI.sol";
import { AccQueueQuinaryMaci } from "maci-contracts/contracts/trees/AccQueueQuinaryMaci.sol";

import { Poll } from "./Poll.sol";

/// @title PollFactory
/// @notice A factory contract which deploys Poll contracts. It allows the MACI contract
/// size to stay within the limit set by EIP-170.
contract PollFactory is BasePollFactory {
  /// @inheritdoc BasePollFactory
  function deploy(
    uint256 duration,
    TreeDepths calldata treeDepths,
    PubKey calldata coordinatorPubKey,
    address maci,
    uint256 emptyBallotRoot
  ) public virtual override returns (address pollAddr) {
    /// @notice deploy a new AccQueue contract to store messages
    AccQueueQuinaryMaci messageAq = new AccQueueQuinaryMaci(treeDepths.messageTreeSubDepth);

    /// @notice the smart contracts that a Poll would interact with
    ExtContracts memory extContracts = ExtContracts({ maci: IMACI(maci), messageAq: messageAq });

    Poll poll = new Poll(duration, treeDepths, coordinatorPubKey, extContracts, emptyBallotRoot);

    messageAq.transferOwnership(address(poll));

    pollAddr = address(poll);
  }
}
