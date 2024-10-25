import { Projects } from "~/features/rounds/components/Projects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";

import type { GetServerSideProps } from "next";

const RoundsPage = ({ roundId }: { roundId: string }): JSX.Element => (
  <LayoutWithSidebar eligibilityCheck showBallot showInfo roundId={roundId} sidebar="left">
    <Projects roundId={roundId} />
  </LayoutWithSidebar>
);

export default RoundsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
