import { type GetServerSideProps } from "next";

import { Layout } from "~/layouts/DefaultLayout";

const SignupPage = (): JSX.Element => <Layout>...</Layout>;

export default SignupPage;

export const getServerSideProps: GetServerSideProps = async () =>
  Promise.resolve({
    redirect: {
      destination: "/signup",
      permanent: false,
    },
  });
