import { usePrivy, useWallets } from "@privy-io/react-auth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

import { config } from "~/config";
import { useIsMobile } from "~/hooks/useIsMobile";

import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { Spinner } from "./ui/Spinner";

interface IConnectedDetailsProps {
  address: string;
  isMobile: boolean;
}

const ConnectedDetails = ({ address, isMobile }: IConnectedDetailsProps) => {
  const { logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const { ready } = useWallets();

  const logoutOfAccount = () => {
    if (!ready) {
      return;
    }
    disconnect();
    logout();
  };

  if (isMobile) {
    return <div />;
  }

  return (
    <div>
      <div className="flex gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button className="my-0 w-48" variant="outline">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}

              <Image alt="dropdown" height="18" src="/dropdown.svg" width="18" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="dark:bg-lightBlack z-[100] w-48 -translate-y-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-0"
              sideOffset={0}
            >
              <DropdownMenu.Item
                className="cursor-pointer p-2 text-sm text-gray-900 outline-none hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                onClick={logoutOfAccount}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

interface IConnectButtonProps {
  showMobile: boolean;
}

const ConnectButton = ({ showMobile }: IConnectButtonProps): JSX.Element | null => {
  const isMobile = useIsMobile();
  const { ready, authenticated, login } = usePrivy();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const isShow = useMemo(() => showMobile === isMobile, [isMobile, showMobile]);

  if (!isShow) {
    return null;
  }

  if (ready && !authenticated) {
    return (
      <Button suppressHydrationWarning variant="secondary" onClick={login}>
        <p>Connect wallet</p>
      </Button>
    );
  }

  if (chainId && ![Number(config.network.id)].includes(chainId)) {
    return (
      <Chip
        color="neutral"
        onClick={() => {
          switchChain({ chainId: config.network.id });
        }}
      >
        Wrong network - switch to {config.network.name}
      </Chip>
    );
  }

  if (ready && authenticated && address) {
    return <ConnectedDetails address={address} isMobile={false} />;
  }

  return (
    <Button className="flex w-48 items-center justify-center" variant="outline">
      <Spinner className="h-6 w-6" />
    </Button>
  );
};

export default dynamic(async () => Promise.resolve(ConnectButton), { ssr: false });
