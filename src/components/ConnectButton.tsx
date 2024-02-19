import Image from "next/image";
import Link from "next/link";
import { type ComponentPropsWithRef, useEffect } from "react";
import { type Address, useEnsAvatar, useEnsName } from "wagmi";
import { FaListCheck } from "react-icons/fa6";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { createBreakpoint } from "react-use";
import { useSession } from "next-auth/react";

import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { useBallot } from "~/features/ballot/hooks/useBallot";
import { EligibilityDialog } from "./EligibilityDialog";
import { useLayoutOptions } from "~/layouts/BaseLayout";
import { useMaci, useApprovedAttestation } from "~/hooks/useMaci";
import { useEthersSigner } from "~/hooks/useEthersSigner";

const useBreakpoint = createBreakpoint({ XL: 1280, L: 768, S: 350 });

export const ConnectButton = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "S";

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

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
                    onClick={openConnectModal}
                    className="rounded-full"
                    variant="primary"
                  >
                    {isMobile ? "Connect" : "Connect wallet"}
                  </Button>
                );
              }

              if (chain.unsupported) {
                return <Chip onClick={openChainModal}>Wrong network</Chip>;
              }

              return (
                <ConnectedDetails
                  account={account}
                  openAccountModal={openAccountModal}
                  isMobile={isMobile}
                />
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};

const ConnectedDetails = ({
  openAccountModal,
  account,
  isMobile,
}: {
  account: { address: string; displayName: string };
  openAccountModal: () => void;
  isMobile: boolean;
}) => {
  const { data: ballot } = useBallot();
  const ballotSize = (ballot?.votes ?? []).length;

  const { eligibilityCheck, showBallot } = useLayoutOptions();

  const { isMaciSignedUp } = useMaci();

  return (
    <div>
      <div className="flex gap-2 text-white">
        {
          !isMaciSignedUp && 
            <SignUpButton address={account.address}>
              Sign Up
            </SignUpButton>
        }
        {(!showBallot || !isMaciSignedUp) ? null : ballot?.publishedAt ? (
          <Chip>Already submitted</Chip>
        ) : (
          <Chip className="gap-2" as={Link} href={"/ballot"}>
            {isMobile ? <FaListCheck className="h-4 w-4" /> : `View Ballot`}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs">
              {ballotSize}
            </div>
          </Chip>
        )}
        <UserInfo
          onClick={openAccountModal}
          address={account.address as Address}
        >
          {isMobile ? null : account.displayName}
        </UserInfo>
        {eligibilityCheck && <EligibilityDialog />}
      </div>
    </div>
  );
};

const UserInfo = ({
  address,
  children,
  ...props
}: { address: Address } & ComponentPropsWithRef<typeof Chip>) => {
  const ens = useEnsName({ address, chainId: 1, enabled: Boolean(address) });
  const name = ens.data;
  const avatar = useEnsAvatar({ name, chainId: 1, enabled: Boolean(name) });

  return (
    <Chip className="gap-2" {...props}>
      <div className="h-6 w-6 overflow-hidden rounded-full">
        {avatar.data ? (
          <Image width={24} height={24} alt={name!} src={avatar.data} />
        ) : (
          <div className="h-full bg-gray-200" />
        )}
      </div>
      {children}
    </Chip>
  );
};

const SignUpButton = ({address, children, ...props}: { address: Address } & ComponentPropsWithRef<typeof Chip>) => {
  const attestation = useApprovedAttestation(address);
  const { signUpMaci } = useMaci();
  const { data } = useSession();
  const signer = useEthersSigner();

  const signup = async () => {
    if (!data) return;
    if (!signer) return;

    await signUpMaci(attestation.data.id, data.publicKey, signer);
  }

  // The signed message need to be changed
  return (
    <Chip className="gap-2" onClick={signup} {...props}>
      {children}
    </Chip>
  );
}
