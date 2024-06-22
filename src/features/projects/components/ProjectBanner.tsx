import { type ComponentProps } from "react";
import { type Address } from "viem";

import { Banner } from "~/components/ui/Banner";
import { useProfileWithMetadata } from "~/hooks/useProfile";

export interface IProjectBannerProps extends ComponentProps<typeof Banner> {
  profileId?: Address;
}

export const ProjectBanner = ({ profileId = undefined, ...rest }: IProjectBannerProps): JSX.Element => {
  const profile = useProfileWithMetadata(profileId);
  const { profileImageUrl, bannerImageUrl } = profile.data ?? {};

  return (
    <div className="overflow-hidden rounded-3xl">
      <Banner {...rest} fallbackSrc={profileImageUrl} src={bannerImageUrl} />
    </div>
  );
};
