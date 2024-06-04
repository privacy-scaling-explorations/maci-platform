import Image from "next/image";

import { config } from "~/config";

export const RoundInfo = () => {
  return (
    <div className="w-full border-b border-gray-200 pb-2">
      <h4>Round</h4>
      <div className="flex items-center gap-2">
        {config.roundLogo && (
          <Image alt="" width="20" height="20" src={`/${config.roundLogo}`} />
        )}
        <h3>{config.roundId}</h3>
      </div>
    </div>
  );
};
