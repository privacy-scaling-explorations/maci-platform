import { useEnsAvatar, useEnsName } from "wagmi";

import { Avatar } from "~/components/ui/Avatar";
import { truncate } from "~/utils/truncate";

import type { Address } from "viem";

interface IENSProps {
  address?: Address;
}

export const AvatarENS = ({ address = "0x" }: IENSProps): JSX.Element => {
  const { data: name } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: Boolean(address),
    },
  });

  const { data: src } = useEnsAvatar({
    name: name ?? undefined,
    query: { enabled: Boolean(name) },
  });
  return (
    <div className="flex items-center gap-2">
      <Avatar rounded="full" size="xs" src={src || undefined} />

      <div>{name ?? truncate(address)}</div>
    </div>
  );
};

export const NameENS = ({ address = "0x" }: IENSProps): JSX.Element => {
  const { data: name } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: Boolean(address),
    },
  });

  return <div>{name ?? truncate(address)}</div>;
};
