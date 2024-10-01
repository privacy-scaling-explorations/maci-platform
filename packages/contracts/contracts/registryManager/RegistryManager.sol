// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ICommon } from "../interfaces/ICommon.sol";
import { IOwnable } from "../interfaces/IOwnable.sol";
import { IRecipientRegistry } from "../interfaces/IRecipientRegistry.sol";
import { IRegistryManager } from "../interfaces/IRegistryManager.sol";

/// @title RegistryManager
/// @notice Contract that allows to use send, approve, reject requests to RecipientRegistry.
contract RegistryManager is Ownable, IRegistryManager, ICommon {
  /// @notice requests
  mapping(uint256 => Request) internal requests;

  /// @inheritdoc IRegistryManager
  uint256 public requestCount;

  /// @notice Initialize registry manager
  constructor() payable Ownable(msg.sender) {}

  /// @notice Check if request is valid
  modifier isValidRequest(Request memory request) {
    if (request.registry == address(0)) {
      revert ValidationError();
    }

    if (request.recipient.recipient == address(0)) {
      revert ValidationError();
    }

    if (IOwnable(request.registry).owner() != address(this)) {
      revert ValidationError();
    }

    uint256 count = IRecipientRegistry(request.registry).recipientCount();
    bool withIndex = request.requestType == RequestType.Change || request.requestType == RequestType.Remove;

    if (request.index >= count && withIndex) {
      revert ValidationError();
    }

    _;
  }

  /// @notice Check if request is pending and exists
  /// @param index Request index
  modifier isPending(uint256 index) {
    if (index >= requestCount || requests[index].status != Status.Pending) {
      revert OperationError();
    }

    _;
  }

  /// @inheritdoc IRegistryManager
  function process(Request memory request) public virtual override isValidRequest(request) {
    request.status = Status.Pending;
    uint256 index = requestCount;

    unchecked {
      requestCount++;
    }

    requests[index] = request;

    emit RequestSent(
      request.registry,
      request.requestType,
      request.recipient.id,
      request.index,
      index,
      request.recipient.recipient,
      request.recipient.metadataUrl
    );
  }

  /// @inheritdoc IRegistryManager
  function approve(uint256 index) public virtual override onlyOwner isPending(index) {
    Request memory request = requests[index];
    IRecipientRegistry registry = IRecipientRegistry(request.registry);

    requests[index].status = Status.Approved;

    emit RequestApproved(
      request.registry,
      request.requestType,
      request.recipient.id,
      request.index,
      index,
      request.recipient.recipient,
      request.recipient.metadataUrl
    );

    if (request.requestType == RequestType.Change) {
      registry.changeRecipient(request.index, request.recipient);
    } else if (request.requestType == RequestType.Remove) {
      registry.removeRecipient(request.index);
    } else {
      registry.addRecipient(request.recipient);
    }
  }

  /// @inheritdoc IRegistryManager
  function reject(uint256 index) public virtual override onlyOwner isPending(index) {
    Request storage request = requests[index];
    request.status = Status.Rejected;

    emit RequestRejected(
      request.registry,
      request.requestType,
      request.recipient.id,
      request.index,
      index,
      request.recipient.recipient,
      request.recipient.metadataUrl
    );
  }

  /// @inheritdoc IRegistryManager
  function getRequest(uint256 index) public view virtual override returns (Request memory request) {
    request = requests[index];
  }
}
