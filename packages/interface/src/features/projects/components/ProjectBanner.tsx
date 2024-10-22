import { type ComponentProps } from "react";

import { Banner } from "~/components/ui/Banner";

export interface IProjectBannerProps extends ComponentProps<typeof Banner> {
  url?: string;
}

export const ProjectBanner = ({ url = undefined, ...rest }: IProjectBannerProps): JSX.Element => (
  <div className="overflow-hidden rounded-xl">
    <Banner {...rest} fallbackSrc={url} src={url} />
  </div>
);
