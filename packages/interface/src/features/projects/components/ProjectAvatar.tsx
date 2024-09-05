import { type ComponentProps } from "react";

import { Avatar } from "~/components/ui/Avatar";
import { useProfileWithMetadata } from "~/hooks/useProfile";

export interface IProjectAvatarProps extends ComponentProps<typeof Avatar> {
  profileId?: string;
  url?: string;
}

export const ProjectAvatar = ({
  profileId = undefined,
  url = undefined,
  ...rest
}: IProjectAvatarProps): JSX.Element => {
  const profile = useProfileWithMetadata(profileId);
  const { profileImageUrl } = profile.data ?? {};

  return <Avatar {...rest} src={profileImageUrl ?? url} />;
};
