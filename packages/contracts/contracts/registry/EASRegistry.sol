// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IEAS } from "../interfaces/IEAS.sol";
import { BaseRegistry } from "./BaseRegistry.sol";

/// @title EASRegistry
/// @notice EAS registry contract
contract EASRegistry is BaseRegistry, IEAS {
  /// @notice The EAS contract
  IEAS public immutable eas;

  /// @notice Create a new instance of the registry contract
  /// @param max The maximum number of projects that can be registered
  /// @param url The metadata url
  /// @param easAddress The EAS address
  /// @param ownerAddress The owner address
  constructor(
    uint256 max,
    string memory url,
    address easAddress,
    address ownerAddress
  ) payable BaseRegistry(max, url, ownerAddress) {
    if (easAddress == address(0)) {
      revert InvalidAddress();
    }

    eas = IEAS(easAddress);
  }

  /// @notice Add multiple recipients to the registry
  /// @param _recipients The recipients
  function addRecipients(Recipient[] calldata _recipients) external onlyOwner {
    uint256 length = _recipients.length;

    for (uint256 i = 0; i < length; ) {
      addRecipient(_recipients[i]);

      unchecked {
        i++;
      }
    }
  }

  /// @inheritdoc IEAS
  function getAttestation(bytes32 id) public view override returns (Attestation memory) {
    return eas.getAttestation(id);
  }
}
