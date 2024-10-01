// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IRecipientRegistry } from "./IRecipientRegistry.sol";

/// @title IRegistryManager
/// @notice An interface for a registry manager. Allows to manage requests for Registry.
interface IRegistryManager {
  /// @notice Enum representing request type
  enum RequestType {
    Add,
    Change,
    Remove
  }

  /// @notice Enum representing request status
  enum Status {
    Pending,
    Approved,
    Rejected
  }

  /// @notice Request data
  struct Request {
    /// @notice index (optional)
    uint256 index;
    /// @notice registry address
    address registry;
    /// @notice request type
    RequestType requestType;
    /// @notice request status
    Status status;
    /// @notice recipient data
    IRecipientRegistry.Recipient recipient;
  }

  /// @notice Events
  event RequestSent(
    address indexed registry,
    RequestType indexed requestType,
    bytes32 indexed recipient,
    uint256 recipientIndex,
    uint256 index,
    address payout,
    string metadataUrl
  );
  event RequestApproved(
    address indexed registry,
    RequestType indexed requestType,
    bytes32 indexed recipient,
    uint256 recipientIndex,
    uint256 index,
    address payout,
    string metadataUrl
  );
  event RequestRejected(
    address indexed registry,
    RequestType indexed requestType,
    bytes32 indexed recipient,
    uint256 recipientIndex,
    uint256 index,
    address payout,
    string metadataUrl
  );

  /// @notice Custom errors
  error OperationError();

  /// @notice Send the request to the Registry
  /// @param request user request
  function process(Request memory request) external;

  /// @notice Approve the request and call registry function
  /// @param index The index of the request
  function approve(uint256 index) external;

  /// @notice Reject the request
  /// @param index The index of the request
  function reject(uint256 index) external;

  /// @notice Get a request
  /// @param index The index of the request
  /// @return request The request to the registry
  function getRequest(uint256 index) external view returns (Request memory request);

  /// @notice Get the number of requests
  /// @return The number of requests
  function requestCount() external view returns (uint256);
}
