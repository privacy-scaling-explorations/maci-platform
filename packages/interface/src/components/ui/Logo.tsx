import Image from "next/image";

import { config, metadata } from "~/config";

export const Logo = (): JSX.Element =>
  config.logoUrl ? (
    <Image alt="logo" className="dark:invert" height="27" src={config.logoUrl} width="144" />
  ) : (
    <div className="flex h-full min-h-10 items-center justify-center rounded-md border border-black font-mono text-sm font-medium">
      {metadata.title}
    </div>
  );
