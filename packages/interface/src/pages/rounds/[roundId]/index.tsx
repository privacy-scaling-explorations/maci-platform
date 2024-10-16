import { Projects } from "~/features/rounds/components/Projects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";

import type { GetServerSideProps } from "next";

export interface IRoundsPageProps {
  roundId: string;
}

const RoundsPage = ({ roundId }: IRoundsPageProps): JSX.Element => (
  <LayoutWithSidebar eligibilityCheck showBallot showInfo roundId={roundId} sidebar="left">
    <Projects roundId={roundId} />
  </LayoutWithSidebar>
);

export default RoundsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
