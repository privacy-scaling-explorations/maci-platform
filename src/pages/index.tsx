import { type GetServerSideProps } from "next";

import { Layout } from "~/layouts/DefaultLayout";

const ProjectsPage = (): JSX.Element => <Layout>...</Layout>;

export default ProjectsPage;

export const getServerSideProps: GetServerSideProps = async () =>
  Promise.resolve({
    redirect: {
      destination: "/projects",
      permanent: false,
    },
  });
