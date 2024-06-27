import { type ReactNode, type PropsWithChildren, useMemo } from "react";
import { useAccount } from "wagmi";

import { BallotOverview } from "~/components/BallotOverview";
import Header from "~/components/Header";
import { Info } from "~/components/Info";
import { Notice } from "~/components/ui/Notice";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { SubmitBallotButton } from "~/features/ballot/components/SubmitBallotButton";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { BaseLayout, type LayoutProps } from "./BaseLayout";

type Props = PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
    showInfo?: boolean;
    showSubmitButton?: boolean;
  } & LayoutProps
>;

export const Layout = ({ children = null, ...props }: Props): JSX.Element => {
  const { address } = useAccount();
  const appState = useAppState();
  const { ballot } = useBallot();

  const navLinks = useMemo(() => {
    const links = [
      {
        href: "/projects",
        children: "Projects",
      },
    ];

    if (ballot.published) {
      links.push({
        href: "/ballot/confirmation",
        children: "My Ballot",
      });
    } else {
      links.push({
        href: "/ballot",
        children: "My Ballot",
      });
    }

    if (appState === EAppState.RESULTS) {
      links.push({
        href: "/stats",
        children: "Stats",
      });
    }

    if (config.admin === address!) {
      links.push(
        ...[
          {
            href: "/applications",
            children: "Applications",
          },
          {
            href: "/voters",
            children: "Voters",
          },
        ],
      );
    }

    return links;
  }, [ballot, appState, address]);

  return (
    <BaseLayout {...props} header={<Header navLinks={navLinks} />}>
      {children}
    </BaseLayout>
  );
};

export const LayoutWithSidebar = ({ ...props }: Props): JSX.Element => {
  const { isRegistered } = useMaci();
  const { address } = useAccount();
  const { ballot } = useBallot();

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          {props.showInfo && <Info showVotingInfo size="sm" />}

          {props.showBallot && address && isRegistered && <BallotOverview />}

          {props.showSubmitButton && ballot.votes.length > 0 && (
            <div className="flex flex-col gap-4">
              <SubmitBallotButton />

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
