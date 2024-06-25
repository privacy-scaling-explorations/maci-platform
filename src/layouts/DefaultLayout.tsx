import { type ReactNode, type PropsWithChildren, useMemo } from "react";
import { useAccount } from "wagmi";

import Header from "~/components/Header";
import { BaseLayout, type LayoutProps } from "./BaseLayout";
import { Info } from "~/components/Info";
import { BallotOverview } from "~/components/BallotOverview";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useBallot } from "~/contexts/Ballot";
import { Notification } from "~/components/ui/Notification";
import { SubmitBallotButton } from "~/features/ballot/components/SubmitBallotButton";

type Props = PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
  } & LayoutProps
>;

export const Layout = ({ children = null, ...props }: Props): JSX.Element => {
  const { address } = useAccount();
  const appState = useAppState();
  const { ballot } = useBallot();

  const navLinks = useMemo(() => {
    const navLinks = [
      {
        href: "/projects",
        children: "Projects",
      },
    ];

    if (ballot?.published) {
      navLinks.push({
        href: "/ballot/confirmation",
        children: "My Ballot",
      });
    } else {
      navLinks.push({
        href: "/ballot",
        children: "My Ballot",
      });
    }

    if (appState === EAppState.RESULTS) {
      navLinks.push({
        href: "/stats",
        children: "Stats",
      });
    }

    if (config.admin === address!) {
      navLinks.push(
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

    return navLinks;
  }, [ballot, appState, address]);

  return (
    <BaseLayout {...props} header={<Header navLinks={navLinks} />}>
      {children}
    </BaseLayout>
  );
};

export function LayoutWithSidebar({ ...props }: Props) {
  const { isRegistered } = useMaci();
  const { address } = useAccount();
  const { ballot } = useBallot();

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          {props.showInfo && <Info size="sm" showVotingInfo={true} />}
          {props.showBallot && address && isRegistered && <BallotOverview />}
          {props.showSubmitButton && ballot && ballot.votes.length > 0 && (
            <div className="flex flex-col gap-4">
              <SubmitBallotButton />
              <Notification
                content="This is not a final submission, you can edit your ballot and resubmit it anytime during the voting period."
                italic
              />
            </div>
          )}
          <div className="h-2"></div>
        </div>
      }
      {...props}
    />
  );
}
