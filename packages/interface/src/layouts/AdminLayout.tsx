import { InvalidAdmin } from "~/features/admin/components/InvalidAdmin";
import { useIsAdmin } from "~/hooks/useIsAdmin";

import { Layout } from "./DefaultLayout";
import { IAdminLayoutProps } from "./types";

export const AdminLayout = ({ children = null, ...props }: IAdminLayoutProps): JSX.Element => {
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
