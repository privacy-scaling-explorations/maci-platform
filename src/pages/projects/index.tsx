import { Projects } from "~/features/projects/components/Projects";
import { LayoutWithBallot } from "~/layouts/DefaultLayout";

const ProjectsPage = (): JSX.Element => (
  <LayoutWithBallot eligibilityCheck showBallot sidebar="left">
    <Projects />
  </LayoutWithBallot>
);

export default ProjectsPage;
