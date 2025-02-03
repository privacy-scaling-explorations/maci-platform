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
  const roundState = useRoundState({ pollId: props.pollId ?? "" });
  const { getBallot } = useBallot();
  const { isRegistered, gatekeeperTrait } = useMaci();

  const ballot = useMemo(() => getBallot(props.pollId!), [props.pollId, getBallot]);

  const navLinks = useMemo(() => {
    const links = [];

    if (roundState !== ERoundState.DEFAULT) {
      links.push({
        label: "round",
        href: `/rounds/${props.pollId}`,
        name: "Projects",
      });
    }

    if (roundState === ERoundState.VOTING && isRegistered) {
      links.push({
        label: "ballot",
        href: `/rounds/${props.pollId}/ballot`,
        name: "My Ballot",
      });
    }

    if (
      (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) &&
      ballot.published &&
      isRegistered
    ) {
      links.push({
        label: "ballot",
        href: `/rounds/${props.pollId}/ballot/confirmation`,
        name: "Submitted Ballot",
      });
    }

    if (roundState === ERoundState.RESULTS) {
      links.push({
        label: "result",
        href: `/rounds/${props.pollId}/result`,
        name: "Result",
      });
    }

    if (config.admin === address! && props.pollId) {
      links.push({
        label: "proposals",
        href: `/rounds/${props.pollId}/proposals`,
        name: "Proposals",
      });
    }

    if (config.admin === address! && gatekeeperTrait === GatekeeperTrait.EAS) {
      links.push(
        ...[
          {
            label: "voters",
            href: "/voters",
            name: "Voters",
          },
          {
            label: "coordinator",
            href: "/coordinator",
            name: "Coordinator",
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
  const { getBallot } = useBallot();

  const roundState = useRoundState({ pollId: props.pollId ?? "" });

  const ballot = useMemo(() => getBallot(props.pollId!), [props.pollId, getBallot]);

  const { showInfo, showBallot, showSubmitButton } = props;

  return (
    <Layout
      sidebarComponent={
        <div>
          <Info
            pollId={props.pollId ?? ""}
            showAppState={showInfo}
            showBallot={roundState !== ERoundState.APPLICATION && !!(showBallot && address && isRegistered)}
            showRoundInfo={showInfo}
            size="sm"
          />

          {showSubmitButton && ballot.votes.length > 0 && (
            <div className="flex flex-col gap-4">
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
