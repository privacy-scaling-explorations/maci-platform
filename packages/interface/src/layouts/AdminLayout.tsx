import { InvalidAdmin } from "~/features/admin/components/InvalidAdmin";
import { useIsAdmin } from "~/hooks/useIsAdmin";

import type { ReactNode, PropsWithChildren } from "react";

import { type LayoutProps } from "./BaseLayout";
import { Layout } from "./DefaultLayout";

type Props = PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
  } & LayoutProps
>;

export const AdminLayout = ({ children = null, ...props }: Props): JSX.Element => {
  const isAdmin = useIsAdmin();
  if (isAdmin) {
    return <Layout {...props}>{children}</Layout>;
  }

  return (
    <Layout {...props}>
      <InvalidAdmin />
    </Layout>
  );
};
