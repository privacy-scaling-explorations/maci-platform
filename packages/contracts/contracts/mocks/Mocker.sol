// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "maci-contracts/contracts/crypto/Hasher.sol";
import "maci-contracts/contracts/crypto/Verifier.sol";
import "maci-contracts/contracts/crypto/MockVerifier.sol";
import "maci-contracts/contracts/gatekeepers/FreeForAllGatekeeper.sol";
import "maci-contracts/contracts/gatekeepers/zupass/ZupassGatekeeper.sol";
import "maci-contracts/contracts/initialVoiceCreditProxy/ConstantInitialVoiceCreditProxy.sol";
import "maci-contracts/contracts/VkRegistry.sol";
import "maci-contracts/contracts/TallyFactory.sol";
import "maci-contracts/contracts/MessageProcessorFactory.sol";

/// @title Mocker
/// @notice import all MACI protocol related contract for tests
contract Mocker {}
