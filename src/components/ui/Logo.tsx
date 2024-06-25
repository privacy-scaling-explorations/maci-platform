import { config, metadata } from "~/config";
import Image from "next/image";

export const Logo = () => (
  <div className="h-10">
    {config.logoUrl ? (
      <Image alt="logo" width="100" height="35" src={config.logoUrl} />
    ) : (
      <div className="flex h-full items-center justify-center rounded-md border border-black px-2 font-mono text-sm font-medium">
        {metadata.title}
      </div>
    )}
  </div>
);
