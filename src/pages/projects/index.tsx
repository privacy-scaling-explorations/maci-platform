import { Projects } from "~/features/projects/components/Projects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";

const ProjectsPage = (): JSX.Element => (
  <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left">
    <Projects />
  </LayoutWithSidebar>
);

export default ProjectsPage;
