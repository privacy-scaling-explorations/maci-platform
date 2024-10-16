import { type ComponentProps } from "react";

import { Avatar } from "~/components/ui/Avatar";

export interface IProjectAvatarProps extends ComponentProps<typeof Avatar> {
  url?: string;
}

export const ProjectAvatar = ({ url = undefined, ...rest }: IProjectAvatarProps): JSX.Element => (
  <Avatar {...rest} src={url} />
);
