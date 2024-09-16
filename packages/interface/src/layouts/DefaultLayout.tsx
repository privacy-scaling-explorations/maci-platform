import { GatekeeperTrait } from "maci-cli/sdk";
import { type ReactNode, type PropsWithChildren, useMemo } from "react";
import { useAccount } from "wagmi";

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

interface ILayoutProps extends PropsWithChildren<LayoutProps> {
  sidebar?: "left" | "right";
  sidebarComponent?: ReactNode;
  showInfo?: boolean;
  showSubmitButton?: boolean;
}

export const Layout = ({ children = null, ...props }: ILayoutProps): JSX.Element => {
  const { address } = useAccount();
  const appState = useAppState();
  const { ballot } = useBallot();
  const { isRegistered, gatekeeperTrait } = useMaci();

  const navLinks = useMemo(() => {
    const links = [
      {
        href: "/projects",
        children: "Projects",
      },
    ];

    if (appState === EAppState.VOTING && isRegistered) {
      links.push({
        href: "/ballot",
        children: "My Ballot",
      });
    }

    if ((appState === EAppState.TALLYING || appState === EAppState.RESULTS) && ballot.published) {
      links.push({
        href: "/ballot/confirmation",
        children: "Submitted Ballot",
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
  }, [ballot.published, appState, isRegistered, address]);

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
  const appState = useAppState();

  const { showInfo, showBallot, showSubmitButton } = props;

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          <Info
            showAppState={showInfo}
            showBallot={appState !== EAppState.APPLICATION && !!(showBallot && address && isRegistered)}
            showRoundInfo={showInfo}
            size="sm"
          />

          {showSubmitButton && ballot.votes.length > 0 && (
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
