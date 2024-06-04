import type { ReactNode, PropsWithChildren } from "react";
import { useAccount } from "wagmi";

import Header from "~/components/Header";
import { BaseLayout, type LayoutProps } from "./BaseLayout";
import { Info } from "~/components/Info";
import { BallotOverview } from "~/components/BallotOverview";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";

type Props = PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
  } & LayoutProps
>;
export const Layout = ({ children, ...props }: Props) => {
  const { address } = useAccount();
  const appState = getAppState();

  const navLinks = [
    {
      href: "/projects",
      children: "Projects",
    },
    {
      href: "/ballot",
      children: "My Ballot",
    },
  ];

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

  return (
    <BaseLayout {...props} header={<Header navLinks={navLinks} />}>
      {children}
    </BaseLayout>
  );
};

export function LayoutWithBallot(props: Props) {
  const { isRegistered } = useMaci();
  const { address } = useAccount();

  return (
    <Layout
      sidebar="left"
      sidebarComponent={
        <div>
          <Info size="sm" showVotingInfo={true} />
          {address && isRegistered && <BallotOverview />}
        </div>
      }
      {...props}
    />
  );
}
