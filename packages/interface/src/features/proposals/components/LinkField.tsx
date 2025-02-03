import { useMemo, type ReactNode } from "react";
import { FaGithub, FaEthereum } from "react-icons/fa";
import { RiGlobalLine } from "react-icons/ri";

import { type ImpactMetrix, type ContributionLink, type FundingSource } from "~/features/projects/types";

interface ILinkFieldProps {
  contributionLink?: ContributionLink;
  impactMetrix?: ImpactMetrix;
  fundingSource?: FundingSource;
}

export const LinkField = ({
  contributionLink = undefined,
  impactMetrix = undefined,
  fundingSource = undefined,
}: ILinkFieldProps): JSX.Element => {
  const logo = useMemo((): JSX.Element | null => {
    if (contributionLink && contributionLink.type === "CONTRACT_ADDRESS") {
      return <FaEthereum />;
    }

    if (contributionLink && contributionLink.type === "GITHUB_REPO") {
      return <FaGithub />;
    }

    if (contributionLink || impactMetrix) {
      return <RiGlobalLine />;
    }

    return null;
  }, [contributionLink, impactMetrix]);

  const title = useMemo((): string | undefined => {
    if (contributionLink) {
      return contributionLink.description;
    }

    if (impactMetrix) {
      return impactMetrix.description;
    }

    if (fundingSource) {
      return fundingSource.description;
    }

    return undefined;
  }, [contributionLink, impactMetrix, fundingSource]);

  const content = useMemo((): ReactNode | undefined => {
    if (contributionLink) {
      return contributionLink.url;
    }

    if (impactMetrix) {
      return (
        <p className="flex gap-2">
          <span>{impactMetrix.url}:</span>

          <span>${impactMetrix.number}</span>
        </p>
      );
    }

    if (fundingSource) {
      return (
        <p className="flex gap-2">
          <span>{fundingSource.amount}</span>

          <span>{fundingSource.currency}</span>
        </p>
      );
    }

    return undefined;
  }, [contributionLink, impactMetrix, fundingSource]);

  return (
    <div className="flex w-full flex-col justify-start gap-2">
      <p className="text-sm text-gray-400">{title}</p>

      <div className="flex items-center gap-2 text-sm text-black">
        {logo}

        {content}
      </div>
    </div>
  );
};
