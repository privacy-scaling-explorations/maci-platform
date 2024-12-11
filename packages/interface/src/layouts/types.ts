import type { ReactNode, PropsWithChildren } from "react";

export interface LayoutProps {
  title?: string;
  requireAuth?: boolean;
  eligibilityCheck?: boolean;
  showBallot?: boolean;
  type?: string;
}

export interface IBaseLayoutProps extends PropsWithChildren<LayoutProps> {
  sidebar?: "left" | "right";
  sidebarComponent?: ReactNode;
  header?: ReactNode;
}

export interface ILayoutProps extends PropsWithChildren<LayoutProps> {
  sidebar?: "left" | "right";
  sidebarComponent?: ReactNode;
  showInfo?: boolean;
  showSubmitButton?: boolean;
  roundId?: string;
  pollId?: string;
}

export interface IAdminLayoutProps extends PropsWithChildren<LayoutProps> {
  sidebar?: "left" | "right";
  sidebarComponent?: ReactNode;
  pollId?: string;
}
