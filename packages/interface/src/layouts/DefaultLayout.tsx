import { GatekeeperTrait } from "maci-cli/sdk";
import { useMemo } from "react";
import { useAccount } from "wagmi";

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
  const { address } = useAccount();
  const roundState = useRoundState(props.roundId ?? "");
  const { ballot } = useBallot();
  const { isRegistered, gatekeeperTrait } = useMaci();

  const navLinks = useMemo(() => {
    const links = [];

    if (roundState !== ERoundState.DEFAULT) {
      links.push({
        href: `/rounds/${props.roundId}`,
        children: "Projects",
      });
    }

    if (roundState === ERoundState.VOTING && isRegistered) {
      links.push({
        href: `/rounds/${props.roundId}/ballot`,
        children: "My Ballot",
      });
    }

    if (
      (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) &&
      ballot.published &&
      isRegistered
    ) {
      links.push({
        href: `/rounds/${props.roundId}/ballot/confirmation`,
        children: "Submitted Ballot",
      });
    }

    if (roundState === ERoundState.RESULTS) {
      links.push({
        href: `/rounds/${props.roundId}/stats`,
        children: "Stats",
      });
    }

    if (config.admin === address! && props.roundId) {
      links.push(
        ...[
          {
            href: `/rounds/${props.roundId}/applications`,
            children: "Applications",
          },
        ],
      );
    }

    if (config.admin === address!) {
      links.push(
        ...[
          {
            href: "/admin",
            children: "Admin",
          },
        ],
      );
    }

    if (config.admin === address! && gatekeeperTrait === GatekeeperTrait.EAS) {
      links.push(
        ...[
          {
            href: "/voters",
            children: "Voters",
          },
        ],
      );
    }

    return links;
  }, [ballot.published, roundState, isRegistered, address]);

  return (
    <BaseLayout {...props} header={<Header navLinks={navLinks} />}>
      {children}
    </BaseLayout>
  );
};

export const LayoutWithSidebar = ({ ...props }: ILayoutProps): JSX.Element => {
  const { isRegistered } = useMaci();
  const { address } = useAccount();
  const { ballot } = useBallot();
  const roundId = props.roundId ?? "";
  const roundState = useRoundState(roundId);

  const { showInfo, showBallot, showSubmitButton } = props;

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          <Info
            roundId={roundId}
            showAppState={showInfo}
            showBallot={roundState !== ERoundState.APPLICATION && !!(showBallot && address && isRegistered)}
            showRoundInfo={showInfo}
            size="sm"
          />

          {showSubmitButton && ballot.votes.length > 0 && (
            <div className="flex flex-col gap-4">
              <SubmitBallotButton roundId={props.roundId ?? ""} />

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
