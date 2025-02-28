import { FaGithub, FaEthereum } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";

import { Link } from "~/components/ui/Link";
import { prefixes } from "~/config";

interface IProjectContactsProps {
  author?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

export const ProjectContacts = ({
  author = undefined,
  website = undefined,
  github = undefined,
  twitter = undefined,
}: IProjectContactsProps): JSX.Element => (
  <div className="grid w-full grid-cols-1 gap-4 border-y border-gray-200 px-2 py-4 font-sans font-medium text-blue-500 xl:grid-cols-2">
    {author && (
      <div className="w-full">
        <Link
          className="w-fit duration-200 hover:text-blue-600"
          href={`${prefixes.ETHER_PREFIX}${author}`}
          target="_blank"
        >
          <FaEthereum />

          {`${author.slice(0, 8)}...${author.slice(-8)}`}
        </Link>
      </div>
    )}

    {twitter && (
      <div className="w-full">
        <Link
          className="w-fit duration-200 hover:text-blue-600"
          href={`${prefixes.TWITTER_PREFIX}${twitter}`}
          target="_blank"
        >
          <FaXTwitter />

          {twitter}
        </Link>
      </div>
    )}

    {website && (
      <div className="w-full">
        <Link className="w-fit duration-200 hover:text-blue-600" href={website} target="_blank">
          <RiGlobalLine />

          {website}
        </Link>
      </div>
    )}

    {github && (
      <div className="w-full">
        <Link
          className="w-fit duration-200 hover:text-blue-600"
          href={`${prefixes.GITHUB_PREFIX}${github}`}
          target="_blank"
        >
          <FaGithub />

          {github}
        </Link>
      </div>
    )}
  </div>
);
