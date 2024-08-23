// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IEAS } from "../interfaces/IEAS.sol";
import { RegistryManager } from "./RegistryManager.sol";

/// @title EASRegistryManager
/// @notice Contract that allows to use send, approve, reject requests to EASRegistry.
contract EASRegistryManager is RegistryManager {
  /// @notice custom errors
  error NotYourAttestation();

  /// @notice EAS
  IEAS public immutable eas;

  /// @notice Initialize EASRegistryManager
  /// @param easAddress EAS contract address
  constructor(address easAddress) payable {
    if (easAddress == address(0)) {
      revert InvalidAddress();
    }

    eas = IEAS(easAddress);
  }

  /// @notice Check recipient has an EAS attestation
  /// @param request request to the registry
  modifier onlyWithAttestation(Request memory request) {
    if (request.requestType != RequestType.Change) {
      _;
      return;
    }

    IEAS.Attestation memory attestation = eas.getAttestation(request.recipient.id);

    if (attestation.recipient != request.recipient.recipient) {
      revert NotYourAttestation();
    }

    _;
  }

  /// @inheritdoc RegistryManager
  function process(
    Request memory request
  ) public virtual override isValidRequest(request) onlyWithAttestation(request) {
    super.process(request);
  }
}
