import { type ComponentProps } from "react";

import { BackgroundImage } from "~/components/ui/BackgroundImage";

export interface IProjectBannerProps extends ComponentProps<typeof BackgroundImage> {
  url?: string;
}

export const ProjectBanner = ({ url = undefined, ...rest }: IProjectBannerProps): JSX.Element => (
  <div className="overflow-hidden">
    <BackgroundImage className="h-[132px] rounded-[10px] lg:h-[211px]" fallbackSrc={url} src={url} {...rest} />
  </div>
);
