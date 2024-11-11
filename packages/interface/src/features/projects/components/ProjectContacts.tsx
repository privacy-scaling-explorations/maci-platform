import { FaGithub, FaEthereum } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";
import { SiFarcaster } from "react-icons/si";

import { Link } from "~/components/ui/Link";
import useScreenSize from "~/hooks/useScreenSize";

interface IProjectContactsProps {
  payoutAddress?: string;
  website?: string;
  github?: string;
  twitter?: string;
  farcaster?: string;
}

export const ProjectContacts = ({
  payoutAddress = undefined,
  website = undefined,
  github = undefined,
  twitter = undefined,
  farcaster = undefined,
}: IProjectContactsProps): JSX.Element => {
  const { width } = useScreenSize();

  return (
    <div className="my-8 grid w-full grid-cols-1 gap-4 border-y border-gray-200 px-2 py-4 text-blue-400 xl:grid-cols-2">
      {payoutAddress && (
        <Link href={`https://etherscan.io/address/${payoutAddress}`} target="_blank">
          <FaEthereum />

          {width <= 640 ? `${payoutAddress.slice(0, 6)}...${payoutAddress.slice(-4)}` : payoutAddress}
        </Link>
      )}

      {twitter && (
        <Link href={`https://x.com/${twitter}`} target="_blank">
          <FaXTwitter />

          {twitter}
        </Link>
      )}

      {farcaster && (
        <Link href={`https://warpcast.com/${farcaster}`} target="_blank">
          <SiFarcaster />

          {farcaster}
        </Link>
      )}

      {website && (
        <Link href={website} target="_blank">
          <RiGlobalLine />

          {website}
        </Link>
      )}

      {github && (
        <Link href={`https://github.com/${github}`} target="_blank">
          <FaGithub />

          {github}
        </Link>
      )}
    </div>
  );
};
