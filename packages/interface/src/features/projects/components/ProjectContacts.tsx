import { FaGithub, FaEthereum } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";

import { Link } from "~/components/ui/Link";
import useScreenSize from "~/hooks/useScreenSize";

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
}: IProjectContactsProps): JSX.Element => {
  const { width } = useScreenSize();

  return (
    <div className="my-8 grid w-full grid-cols-1 gap-4 border-y border-gray-200 px-2 py-4 text-blue-400 xl:grid-cols-2">
      {author && (
        <Link href={`https://etherscan.io/address/${author}`} target="_blank">
          <FaEthereum />

          {width <= 640 ? `${author.slice(0, 6)}...${author.slice(-4)}` : author}
        </Link>
      )}

      {twitter && (
        <Link href="https://x.com" target="_blank">
          <FaXTwitter />
          x.com
        </Link>
      )}

      {website && (
        <Link href={website} target="_blank">
          <RiGlobalLine />

          {website}
        </Link>
      )}

      {github && (
        <Link href="https://github.com" target="_blank">
          <FaGithub />

          {github}
        </Link>
      )}
    </div>
  );
};
