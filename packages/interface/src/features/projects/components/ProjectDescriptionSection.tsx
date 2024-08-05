import { FaGithub, FaEthereum } from "react-icons/fa";
import { RiGlobalLine } from "react-icons/ri";

import { Link } from "~/components/ui/Link";

import { type ImpactMetrix, type ContributionLink, type FundingSource, EContributionType } from "../types";

interface ProjectDescriptionSectionProps {
  title: string;
  description?: string;
  contributions?: ContributionLink[];
  impacts?: ImpactMetrix[];
  fundings?: FundingSource[];
}

export const ProjectDescriptionSection = ({
  title,
  description = "",
  contributions = [],
  impacts = [],
  fundings = [],
}: ProjectDescriptionSectionProps): JSX.Element => (
  <div className="flex flex-col gap-6">
    <p className="text-lg uppercase">{title}</p>

    {description.length > 0 && <p className="text-lg text-gray-400">{description}</p>}

    {contributions.length > 0 && (
      <div className="border-l border-gray-200 px-4">
        <p className="text-sm uppercase text-gray-800">{title} links</p>

        {contributions.map((link) => (
          <Link key={link.type} href={link.url} target="_blank">
            {link.type === (EContributionType.GITHUB_REPO as string) && <FaGithub />}

            {link.type === (EContributionType.CONTRACT_ADDRESS as string) && <FaEthereum />}

            {link.type === (EContributionType.OTHER as string) && <RiGlobalLine />}

            {link.description}
          </Link>
        ))}
      </div>
    )}

    {impacts.length > 0 && (
      <div className="border-l border-gray-200 px-4">
        <p className="text-sm uppercase text-gray-800">{title} links</p>

        {impacts.map((link) => (
          <Link key={link.description} href={link.url} target="_blank">
            {link.description}

            {link.number && ` - ${link.number}k`}
          </Link>
        ))}
      </div>
    )}

    {fundings.length > 0 && (
      <div className="text-sm text-gray-400">
        {fundings.map((funding) => (
          <div key={funding.type} className="flex items-center gap-2">
            {funding.description}

            <div className="h-0.5 w-8 bg-blue-400" />

            <p className="capitalize">{funding.type.split("_").join(" ").toLowerCase()}</p>

            <p>{funding.amount}</p>

            <p>{funding.currency}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
