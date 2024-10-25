import { Projects } from "~/features/rounds/components/Projects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";

import type { GetServerSideProps } from "next";

const RoundsPage = ({ pollId }: { pollId: string }): JSX.Element => (
  <LayoutWithSidebar eligibilityCheck showBallot showInfo pollId={pollId} sidebar="left">
    <Projects pollId={pollId} />
  </LayoutWithSidebar>
);

export default RoundsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
