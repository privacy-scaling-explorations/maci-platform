import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { type ComponentPropsWithRef, useCallback } from "react";
import { FaListCheck } from "react-icons/fa6";
import { createBreakpoint } from "react-use";
import { toast } from "sonner";
import { useEnsAvatar, useEnsName } from "wagmi";

import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useLayoutOptions } from "~/layouts/BaseLayout";

import type { Address } from "viem";

import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, S: 350 });

const UserInfo = ({ address, children, ...props }: { address: Address } & ComponentPropsWithRef<typeof Chip>) => {
  const ens = useEnsName({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });
  const name = ens.data ?? undefined;
  const avatar = useEnsAvatar({
    name,
    chainId: 1,
    query: { enabled: Boolean(name) },
  });

  return (
    <Chip className="gap-2" {...props}>
      <div className="h-6 w-6 overflow-hidden rounded-full">
        {avatar.data ? (
          <Image alt={name!} height={24} src={avatar.data} width={24} />
        ) : (
          <div className="h-full bg-gray-200" />
        )}
      </div>

      {children}
    </Chip>
  );
};

const SignupButton = ({
  loading,
  ...props
}: ComponentPropsWithRef<typeof Chip> & { loading: boolean }): JSX.Element => (
  <Chip className="gap-2" disabled={loading} {...props}>
    {loading ? "Loading..." : "Sign up"}
  </Chip>
);

const ConnectedDetails = ({
  openAccountModal,
  account,
  isMobile,
}: {
  account: { address: string; displayName: string };
  openAccountModal: () => void;
  isMobile: boolean;
}) => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup } = useMaci();
  const { ballot } = useBallot();
  const ballotSize = (ballot?.votes ?? []).length;

  const { showBallot } = useLayoutOptions();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(() => onSignup(onError), [onSignup, onError]);

  return (
    <div>
      <div className="flex gap-2 text-white">
        {!isEligibleToVote && <Chip>You are not allowed to vote</Chip>}

        {isEligibleToVote && !isRegistered && (
          <SignupButton loading={isRegistered === undefined || isLoading} onClick={handleSignup} />
        )}

        {isRegistered && showBallot && ballot?.published && <Chip>Already submitted</Chip>}

        {isRegistered && showBallot && !ballot?.published && (
          <Chip as={Link} className="gap-2" href="/ballot">
            {isMobile ? <FaListCheck className="h-4 w-4" /> : `View Ballot`}

            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs">
              {ballotSize}
            </div>
          </Chip>
        )}

        <UserInfo address={account.address as Address} onClick={openAccountModal}>
          {isMobile ? null : account.displayName}
        </UserInfo>
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
                  <Button
                    suppressHydrationWarning
                    className="rounded-full"
                    variant="primary"
                    onClick={openConnectModal}
                  >
                    {isMobile ? "Connect" : "Connect wallet"}
                  </Button>
                );
              }

              if (chain.unsupported ?? ![Number(config.network.id)].includes(chain.id)) {
                return <Chip onClick={openChainModal}>Wrong network</Chip>;
              }

              return <ConnectedDetails account={account} isMobile={isMobile} openAccountModal={openAccountModal} />;
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
