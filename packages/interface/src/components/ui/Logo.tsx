import Image from "next/image";

import { config, metadata } from "~/config";

export const Logo = (): JSX.Element => (
  <div className="h-15">
    {config.logoUrl ? (
      <>
        <Image alt="logo" className="dark:hidden" height="35" src={config.logoUrl} width="150" />

        <Image alt="logo" className="hidden dark:block" height="35" src={config.logoDarkUrl} width="150" />
      </>
    ) : (
      <div className="flex h-full items-center justify-center rounded-md border border-black px-2 font-mono text-sm font-medium">
        {metadata.title}
      </div>
    )}
  </div>
);
