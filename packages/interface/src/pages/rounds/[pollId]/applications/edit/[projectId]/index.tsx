import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId, projectId } }) =>
  Promise.resolve({
    props: { pollId, projectId },
  });

const EditProjectPage = ({ pollId, projectId }: { pollId: string; projectId: string }): JSX.Element => (
  <div>{`edit round ${pollId} : ${projectId}`}</div>
);

export default EditProjectPage;
