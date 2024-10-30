// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IPayoutStrategy
/// @notice Interface responsible for payout strategy
interface IPayoutStrategy {
  /// @notice Strategy initialization params
  struct StrategyInit {
    /// @notice The cooldown duration for withdrawal extra funds
    uint256 cooldownTime;
    /// @notice The max contribution amount
    uint256 maxContribution;
    /// @notice The max cap
    uint256 maxCap;
    /// @notice The payout token
    address payoutToken;
  }

  /// @notice Claim params
  struct Claim {
    /// @notice The index of the vote option to verify the correctness of the tally
    uint256 index;
    /// @notice The voice credit options received for recipient
    uint256 voiceCreditsPerOption;
    /// @notice Corresponding proof of the tally result
    uint256[][] tallyResultProof;
    /// @notice The respective salt in the results object in the tally.json
    uint256 tallyResultSalt;
    /// @notice Depth of the vote option tree
    uint8 voteOptionTreeDepth;
    /// @notice hashLeftRight(number of spent voice credits, spent salt)
    uint256 spentVoiceCreditsHash;
    /// @notice hashLeftRight(merkle root of the no spent voice
    uint256 perVOSpentVoiceCreditsHash;
  }

  /// @notice Total deposited amount
  function totalAmount() external view returns (uint256);

  /// @notice The cooldown timeout
  function cooldown() external view returns (uint256);

  /// @notice Deposit amount
  /// @param amount The amount
  function deposit(uint256 amount) external;

  /// @notice Withdraw extra amount
  /// @param receivers The receivers addresses
  /// @param amounts The amounts
  function withdrawExtra(address[] calldata receivers, uint256[] calldata amounts) external;

  /// @notice Claim funds for recipient
  /// @param params The claim params
  function claim(Claim calldata params) external;
}
