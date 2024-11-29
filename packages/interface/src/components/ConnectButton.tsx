import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { createBreakpoint } from "react-use";

import { config } from "~/config";

import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, S: 350 });

interface IConnectedDetailsProps {
  account: { address: string; displayName: string; ensName?: string };
  openAccountModal: () => void;
  isMobile: boolean;
}

const ConnectedDetails = ({ openAccountModal, account, isMobile }: IConnectedDetailsProps) => {
  const displayName = isMobile ? null : account.ensName || account.displayName;

  return (
    <div>
      <div className="flex gap-2 text-white">
        <Chip color="neutral" onClick={openAccountModal}>
          {displayName}

          <Image alt="dropdown" height="18" src="/dropdown.svg" width="18" />
        </Chip>
      </div>
    </div>
  );
};

export const ConnectButton = (): JSX.Element => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "S";

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted, authenticationStatus }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button suppressHydrationWarning variant="secondary" onClick={openConnectModal}>
                    {isMobile ? "Connect" : "Connect wallet"}
                  </Button>
                );
              }

              if (chain.unsupported ?? ![Number(config.network.id)].includes(chain.id)) {
                return (
                  <Chip color="disabled" onClick={openChainModal}>
                    Wrong network
                  </Chip>
                );
              }

              return <ConnectedDetails account={account} isMobile={isMobile} openAccountModal={openAccountModal} />;
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
