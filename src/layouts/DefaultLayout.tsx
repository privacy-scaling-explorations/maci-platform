import { useAccount } from "wagmi";

import Header from "~/components/Header";
import { config } from "~/config";
import BallotOverview from "~/features/ballot/components/BallotOverview";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import type { ReactNode, PropsWithChildren } from "react";

import { BaseLayout, type LayoutProps } from "./BaseLayout";

type Props = PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
  } & LayoutProps
>;

export const Layout = ({ children = null, ...props }: Props): JSX.Element => {
  const { address } = useAccount();
  const appState = useAppState();

  const navLinks = [
    {
      href: "/projects",
      children: "Projects",
    },
    {
      href: "/info",
      children: "Info",
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

export const LayoutWithBallot = ({ ...props }: Props): JSX.Element => (
  <Layout sidebar="left" sidebarComponent={<BallotOverview />} {...props} />
);
