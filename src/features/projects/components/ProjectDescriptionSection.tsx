import { FaGithub, FaEthereum } from "react-icons/fa";
import { RiGlobalLine } from "react-icons/ri";
import { Link } from "~/components/ui/Link";

import {
  type ImpactMetrix,
  type ContributionLink,
  type FundingSource,
  EContributionType,
} from "../types";

interface ProjectDescriptionSectionProps {
  title: string;
  description?: string;
  links?: ContributionLink[] | ImpactMetrix[];
  fundings?: FundingSource[];
}

export const ProjectDescriptionSection = ({
  title,
  description,
  links,
  fundings,
}: ProjectDescriptionSectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg uppercase">{title}</p>
      {description && <p className="text-lg text-gray-400">{description}</p>}
      {links && (
        <div className="border-l border-gray-200 px-4">
          <p className="text-sm uppercase text-gray-800">{title} links</p>
          {links.map((link) => (
            <Link href={link.url} target="_blank">
              {link.type && link.type === EContributionType.GITHUB_REPO && (
                <FaGithub />
              )}
              {link.type &&
                link.type === EContributionType.CONTRACT_ADDRESS && (
                  <FaEthereum />
                )}
              {link.type && link.type === EContributionType.OTHER && (
                <RiGlobalLine />
              )}
              {link.description}
              {link.number && ` - ${link.number}k`}
            </Link>
          ))}
        </div>
      )}
      {fundings && (
        <div className="text-sm text-gray-400">
          {fundings.map((funding) => (
            <div className="flex items-center gap-2">
              {funding.description}
              <div className="h-0.5 w-8 bg-blue-400" />
              <p className="capitalize">
                {funding.type.split("_").join(" ").toLowerCase()}
              </p>
              <p>{funding.amount}</p>
              <p>{funding.currency}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
