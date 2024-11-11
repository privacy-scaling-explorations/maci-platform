import { useWallets, usePrivy } from "@privy-io/react-auth";
import { GatekeeperTrait } from "maci-cli/sdk";
import { useMemo } from "react";

import Header from "~/components/Header";
import { Info } from "~/components/Info";
import { Notice } from "~/components/ui/Notice";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { SubmitBallotButton } from "~/features/ballot/components/SubmitBallotButton";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { ILayoutProps } from "./types";

import { BaseLayout } from "./BaseLayout";

export const Layout = ({ children = null, ...props }: ILayoutProps): JSX.Element => {
  const { wallets } = useWallets();

  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask"),
    [wallets],
  );

  const roundState = useRoundState(props.pollId ?? "");
  const { getBallot } = useBallot();
  const { isRegistered, gatekeeperTrait } = useMaci();

  const ballot = useMemo(() => getBallot(props.pollId!), [props.pollId, getBallot]);

  const navLinks = useMemo(() => {
    const links = [];

    if (roundState !== ERoundState.DEFAULT) {
      links.push({
        href: `/rounds/${props.pollId}`,
        children: "Projects",
      });
    }

    if (roundState === ERoundState.VOTING && isRegistered) {
      links.push({
        href: `/rounds/${props.pollId}/ballot`,
        children: "My Ballot",
      });
    }

    if (
      (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) &&
      ballot.published &&
      isRegistered
    ) {
      links.push({
        href: `/rounds/${props.pollId}/ballot/confirmation`,
        children: "Submitted Ballot",
      });
    }

    if (roundState === ERoundState.RESULTS) {
      links.push({
        href: `/rounds/${props.pollId}/stats`,
        children: "Stats",
      });
    }

    if (wallet && config.admin === wallet.address && props.pollId) {
      links.push({
        href: `/rounds/${props.pollId}/applications`,
        children: "Applications",
      });
    }

    if (wallet && config.admin === wallet.address && gatekeeperTrait === GatekeeperTrait.EAS) {
      links.push(
        ...[
          {
            href: "/voters",
            children: "Voters",
          },
          {
            href: "/coordinator",
            children: "Coordinator",
          },
        ],
      );
    }

    return links;
  }, [ballot.published, roundState, isRegistered, wallets]);

  return (
    <BaseLayout {...props} header={<Header navLinks={navLinks} />}>
      {children}
    </BaseLayout>
  );
};

export const LayoutWithSidebar = ({ ...props }: ILayoutProps): JSX.Element => {
  const { isRegistered } = useMaci();
  const { authenticated } = usePrivy();
  const { getBallot } = useBallot();

  const roundState = useRoundState(props.pollId ?? "");

  const ballot = useMemo(() => getBallot(props.pollId!), [props.pollId, getBallot]);

  const { showInfo, showBallot, showSubmitButton } = props;

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          <Info
            pollId={props.pollId ?? ""}
            showAppState={showInfo}
            showBallot={roundState !== ERoundState.APPLICATION && !!(showBallot && authenticated && isRegistered)}
            showRoundInfo={showInfo}
            size="sm"
          />

          {showSubmitButton && ballot.votes.length > 0 && (
            <div className="mt-4 flex flex-col gap-4">
              <SubmitBallotButton pollId={props.pollId ?? ""} />

              <Notice
                italic
                content="This is not a final submission, you can edit your ballot and resubmit it anytime during the voting period."
              />
            </div>
          )}

          <div className="h-2" />
        </div>
      }
      {...props}
    />
  );
};
