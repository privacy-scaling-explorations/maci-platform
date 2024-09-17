// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ICommon } from "../interfaces/ICommon.sol";
import { IRecipientRegistry } from "../interfaces/IRecipientRegistry.sol";

/// @title BaseRegistry
/// @notice Base contract for a registry
abstract contract BaseRegistry is Ownable, IRecipientRegistry, ICommon {
  /// @notice The storage of recipients
  mapping(uint256 => Recipient) internal recipients;

  /// @inheritdoc IRecipientRegistry
  uint256 public immutable maxRecipients;

  /// @inheritdoc IRecipientRegistry
  uint256 public recipientCount;

  /// @notice The registry metadata url
  string internal metadataUrl;

  /// @notice Create a new instance of the registry contract
  /// @param max The maximum number of recipients that can be registered
  /// @param url The metadata url
  /// @param ownerAddress The owner address
  constructor(uint256 max, string memory url, address ownerAddress) payable Ownable(ownerAddress) {
    maxRecipients = max;
    metadataUrl = url;
  }

  /// @inheritdoc IRecipientRegistry
  function getRegistryMetadataUrl() public view virtual override returns (string memory) {
    return metadataUrl;
  }

  /// @inheritdoc IRecipientRegistry
  function addRecipient(Recipient calldata recipient) public virtual override onlyOwner returns (uint256) {
    uint256 index = recipientCount;

    if (index >= maxRecipients) {
      revert MaxRecipientsReached();
    }

    if (recipient.recipient == address(0)) {
      revert InvalidInput();
    }

    recipients[index] = recipient;
    recipientCount++;

    emit RecipientAdded(index, recipient.id, recipient.metadataUrl, recipient.recipient);

    return index;
  }

  /// @inheritdoc IRecipientRegistry
  function removeRecipient(uint256 index) public virtual override onlyOwner {
    if (index >= recipientCount) {
      revert InvalidIndex();
    }

    Recipient memory recipient = recipients[index];

    delete recipients[index];
    recipientCount--;

    emit RecipientRemoved(index, recipient.id, recipient.recipient);
  }

  /// @inheritdoc IRecipientRegistry
  function changeRecipient(uint256 index, Recipient calldata recipient) public virtual override onlyOwner {
    if (index >= recipientCount) {
      revert InvalidIndex();
    }

    if (recipient.recipient == address(0)) {
      revert InvalidInput();
    }

    recipients[index].recipient = recipient.recipient;
    recipients[index].metadataUrl = recipient.metadataUrl;

    emit RecipientChanged(index, recipient.id, recipient.metadataUrl, recipient.recipient);
  }

  /// @inheritdoc IRecipientRegistry
  function getRecipient(uint256 index) public view virtual override returns (Recipient memory) {
    return recipients[index];
  }
}
