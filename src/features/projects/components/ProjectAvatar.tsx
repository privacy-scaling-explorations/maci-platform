import { type ComponentProps } from "react";
import { type Address } from "viem";

import { Avatar } from "~/components/ui/Avatar";
import { useProfileWithMetadata } from "~/hooks/useProfile";

export interface IProjectAvatarProps extends ComponentProps<typeof Avatar> {
  profileId?: Address;
}

export const ProjectAvatar = ({ profileId = undefined, ...rest }: IProjectAvatarProps): JSX.Element => {
  const profile = useProfileWithMetadata(profileId);
  const { profileImageUrl } = profile.data ?? {};

  return <Avatar {...rest} src={profileImageUrl} />;
};
