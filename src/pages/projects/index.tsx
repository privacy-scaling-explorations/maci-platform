import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { Projects } from "~/features/projects/components/Projects";

const ProjectsPage = (): JSX.Element => {
  return (
    <LayoutWithSidebar sidebar="left" eligibilityCheck showBallot showInfo>
      <Projects />
    </LayoutWithSidebar>
  );
}

export default ProjectsPage;
