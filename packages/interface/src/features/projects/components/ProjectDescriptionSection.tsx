import { ExternalLinkIcon } from "lucide-react";
import { FaGithub, FaEthereum } from "react-icons/fa";
import { RiGlobalLine } from "react-icons/ri";
import Markdown from "react-markdown";

import { Link } from "~/components/ui/Link";
import { markdownComponents } from "~/components/ui/MarkdownComponents";

import { type ContributionLink, type FundingSource, EContributionType } from "../types";

interface ProjectDescriptionSectionProps {
  title: string;
  description?: string;
  contributions?: ContributionLink[];
  fundings?: FundingSource[];
}

export const ProjectDescriptionSection = ({
  title,
  description = "",
  contributions = [],
  fundings = [],
}: ProjectDescriptionSectionProps): JSX.Element => (
  <div className="flex flex-col gap-5">
    <h3 className="font-sans text-lg font-bold uppercase leading-[27px] dark:text-white">{title}</h3>

    {description.length > 0 && <Markdown components={markdownComponents}>{description}</Markdown>}

    {contributions.length > 0 && (
      <div className="border-l border-gray-200 px-[10px]">
        <span className="font-sans text-sm font-semibold uppercase leading-5 text-gray-800">{`${title} links`}</span>

        {contributions.map((link) => (
          <Link key={link.type} href={link.url} target="_blank">
            {link.type === (EContributionType.GITHUB_REPO as string) && <FaGithub />}

            {link.type === (EContributionType.CONTRACT_ADDRESS as string) && <FaEthereum />}

            {link.type === (EContributionType.OTHER as string) && <RiGlobalLine />}

            {link.description}

            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        ))}
      </div>
    )}

    {fundings.length > 0 && (
      <div className="text-sm text-gray-400">
        {fundings.map((funding) => (
          <div key={funding.type} className="flex items-center gap-2">
            <span className="font-sans text-sm font-semibold uppercase leading-5 text-gray-800">
              {funding.description}
            </span>

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
