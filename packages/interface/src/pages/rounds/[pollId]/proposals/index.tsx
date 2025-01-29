import { ProposalsToApprove } from "~/features/proposals/components/ProposalsToApprove";
import { AdminLayout } from "~/layouts/AdminLayout";

import type { GetServerSideProps } from "next";

interface IProposalsPageProps {
  pollId: string;
}

const ProposalsPage = ({ pollId }: IProposalsPageProps): JSX.Element => (
  <AdminLayout pollId={pollId} title="Review proposals">
    <ProposalsToApprove pollId={pollId} />
  </AdminLayout>
);

export default ProposalsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
