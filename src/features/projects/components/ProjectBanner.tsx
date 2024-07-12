import { type ComponentProps } from "react";
import { type Address } from "viem";

import { Banner } from "~/components/ui/Banner";
import { useProfileWithMetadata } from "~/hooks/useProfile";

export interface IProjectBannerProps extends ComponentProps<typeof Banner> {
  profileId?: Address;
  url?: string;
}

export const ProjectBanner = ({
  profileId = undefined,
  url = undefined,
  ...rest
}: IProjectBannerProps): JSX.Element => {
  const profile = useProfileWithMetadata(profileId);
  const { profileImageUrl, bannerImageUrl } = profile.data ?? {};

  return (
    <div className="overflow-hidden rounded-xl">
      <Banner {...rest} fallbackSrc={profileImageUrl ?? url} src={bannerImageUrl ?? url} />
    </div>
  );
};
