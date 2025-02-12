import { type ComponentProps } from "react";

import { BackgroundImage } from "~/components/ui/BackgroundImage";
import { cn } from "~/utils/classNames";

export interface IProjectBannerProps extends ComponentProps<typeof BackgroundImage> {
  url?: string;
  size?: "sm" | "lg";
}

export const ProjectBanner = ({
  url = undefined,
  size = "lg",
  className,
  ...rest
}: IProjectBannerProps): JSX.Element => (
  <div className="overflow-hidden">
    <BackgroundImage
      className={cn("rounded-[10px]", className, {
        "h-[134px]": size === "sm",
        "h-[211px]": size === "lg",
      })}
      fallbackSrc={url}
      src={url}
      {...rest}
    />
  </div>
);
