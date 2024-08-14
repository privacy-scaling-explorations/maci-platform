// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IEAS } from "../interfaces/IEAS.sol";
import { BaseRegistry } from "./BaseRegistry.sol";

contract EASRegistry is Ownable, BaseRegistry, IEAS {
  /// @notice The EAS contract
  IEAS public immutable eas;

  /// @notice Create a new instance of the registry contract
  /// @param _maxRecipients The maximum number of projects that can be registered
  /// @param _metadataUrl The metadata url
  /// @param _eas The EAS address
  constructor(
    uint256 _maxRecipients,
    bytes32 _metadataUrl,
    address _eas
  ) payable Ownable(msg.sender) BaseRegistry(_maxRecipients, _metadataUrl) {
    eas = IEAS(_eas);
  }

  /// @notice Add multiple recipients to the registry
  /// @param recipients The recipients
  function addRecipients(Recipient[] calldata recipients) external onlyOwner {
    uint256 length = recipients.length;

    for (uint256 i = 0; i < length; ) {
      addRecipient(recipients[i]);

      unchecked {
        i++;
      }
    }
  }

  /// @inheritdoc BaseRegistry
  function addRecipient(Recipient calldata recipient) public override onlyOwner returns (uint256) {
    return super.addRecipient(recipient);
  }

  /// @notice Edit the address of a project
  /// @param index The index of the project to edit
  /// @param recipient The new recipient
  function changeRecipient(uint256 index, Recipient calldata recipient) public override onlyOwner {
    super.changeRecipient(index, recipient);
  }

  /// @inheritdoc BaseRegistry
  function removeRecipient(uint256 index) public override onlyOwner {
    super.removeRecipient(index);
  }

  /// @inheritdoc IEAS
  function getAttestation(bytes32 id) public view override returns (Attestation memory) {
    return eas.getAttestation(id);
  }
}
