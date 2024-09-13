# Smart Contracts Documentation

## Overview

Below is the UML diagram representing the relationships and interactions between the contracts:

![UML Diagram](./diagram.svg)

## Contract Interaction Overview

This document provides a brief explanation of the interactions between the `MACI`, `PollFactory`, `Poll`, `IRegistryManager`, and `EASRegistry` contracts.

### MACI and PollFactory

- **Role**: The `MACI` contract uses the `PollFactory` to deploy new `Poll` contracts.
- **Details**:
  - `MACI` holds a reference to the `PollFactory` contract.
  - `MACI` invokes the `deploy` method of the `PollFactory` to create new `Poll` instances.
  - The `PollFactory` is responsible for deploying polls with the necessary parameters such as duration, tree depths, and coordinator's public key.

### MACI and IRegistryManager

- **Role**: The `MACI` contract interacts with the `IRegistryManager` to manage and maintain registry-related data.
- **Details**:
  - `MACI` holds a reference to the `IRegistryManager` contract.
  - `MACI` can set or query the `IRegistryManager` for managing requests and registry information.

### Poll and IRegistryManager

- **Role**: The `Poll` contract uses the `IRegistryManager` for handling registry-related actions specific to the poll.
- **Details**:
  - The `Poll` contract has an address for the `IRegistryManager`.
  - `Poll` may call methods on the `IRegistryManager` to update or retrieve registry-related information.

### Poll and EASRegistry

- **Role**: The `Poll` contract interacts with the `EASRegistry` to access or update information about projects or entities.
- **Details**:
  - `Poll` has a `registry` property that holds the address of the `EASRegistry` contract.
  - `Poll` uses this address to perform operations related to project data.

### EASRegistryManager and EASRegistry

- **Role**: The `EASRegistryManager` manages and interacts with the `EASRegistry`.
- **Details**:
  - `EASRegistryManager` handles requests and maintains control over the operations of the `EASRegistry`.
  - `EASRegistryManager` may call methods on `EASRegistry` to add or retrieve EAS (External Authentication Service) entries.

### Interaction summary

- **`MACI`**:

  - Contains a `PollFactory` to deploy `Poll` contracts.
  - Contains an `IRegistryManager` to manage registry data.

- **`PollFactory`**:

  - Deploys `Poll` contracts as directed by the `MACI` contract.

- **`Poll`**:

  - Uses `EASRegistry` to access project information.
  - Interacts with `IRegistryManager` for registry-related actions.

- **`IRegistryManager`**:

  - Manages requests and registry data, interacting with `Poll` and potentially `EASRegistry`.

- **`EASRegistry`**:
  - Provides information about projects, used by `Poll`.

This interaction structure ensures modularity and clear responsibilities for each contract, facilitating effective coordination and functionality within the system.

## Integration with `maci-subgraph`

The integration with `maci-subgraph` is similar to the integration with the EAS contracts. However, additional entities are involved:

- **Request**: Represents requests to the `RegistryManager` for approval or rejection.
- **Recipient**: Represents entities (projects) in the registry.
- **Registry**: Stores recipient information and manages access.

## Interaction with Frontend

- **EASRegistryManager**: This contract is used for submitting requests and handling approvals/rejections. It provides access control and management functionality.
- **EASRegistry**: Allows reading of project information. If integrated with a subgraph, this contract's data may be accessed directly from the subgraph for frontend purposes.

Ensure that the frontend integration leverages the subgraph where applicable to reduce direct interactions with the `EASRegistry` contract, improving efficiency and performance.
