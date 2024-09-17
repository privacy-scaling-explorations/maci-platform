// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IRecipientRegistry
/// @notice An interface for a recipient registry
interface IRecipientRegistry {
  /// @notice A struct representing a recipient
  struct Recipient {
    // recipient id (optional)
    bytes32 id;
    // recipient metadata url
    string metadataUrl;
    // recipient address
    address recipient;
  }

  /// @notice Events
  event RecipientAdded(uint256 indexed index, bytes32 id, string metadataUrl, address indexed payout);
  event RecipientRemoved(uint256 indexed index, bytes32 id, address indexed payout);
  event RecipientChanged(uint256 indexed index, bytes32 id, string metadataUrl, address indexed newPayout);

  /// @notice Custom errors
  error MaxRecipientsReached();

  /// @notice Get a registry metadata url
  /// @return The metadata url in a string format
  function getRegistryMetadataUrl() external view returns (string memory);

  /// @notice Add a recipient
  /// @param recipient The recipient data
  /// @return The index of the recipient
  function addRecipient(Recipient calldata recipient) external returns (uint256);

  /// @notice Remove a recipient
  /// @param index The index of the recipient
  function removeRecipient(uint256 index) external;

  /// @notice Change a recipient
  /// @param index The index of the recipient
  function changeRecipient(uint256 index, Recipient calldata recipient) external;

  /// @notice Get a recipient
  /// @param index The index of the recipient
  /// @return The address of the recipient and metadata url or id
  function getRecipient(uint256 index) external view returns (Recipient memory);

  /// @notice Get the max number of recipients
  /// @return The max number of recipients
  function maxRecipients() external view returns (uint256);

  /// @notice Get the number of recipients
  /// @return The number of recipients
  function recipientCount() external view returns (uint256);
}
