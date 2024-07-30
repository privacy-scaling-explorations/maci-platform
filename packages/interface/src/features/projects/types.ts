export enum EContributionType {
  CONTRACT_ADDRESS = "CONTRACT_ADDRESS",
  GITHUB_REPO = "GIGHUB_REPO",
  OTHER = "OTHER",
}

export enum EFundingSourceType {
  OTHER = "OTHER",
  RETROPGF_2 = "RETROPGF_2",
  GOVERNANCE_FUND = "GOVERNANCE_FUND",
  PARTNER_FUND = "PARTNER_FUND",
  REVENUE = "REVENUE",
}

export enum EButtonState {
  DEFAULT,
  ADDED,
  EDIT,
  UPDATED,
}

export enum EProjectState {
  UNREGISTERED,
  DEFAULT,
  ADDED,
  SUBMITTED,
}

export interface ImpactMetrix {
  url: string;
  description?: string;
  number: number;
}

export interface ContributionLink {
  url: string;
  type: EContributionType | string;
  description?: string;
}

export interface FundingSource {
  type: EFundingSourceType | string;
  description?: string;
  currency: string;
  amount: number;
}
