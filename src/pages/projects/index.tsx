import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { Projects } from "~/features/projects/components/Projects";

export default function ProjectsPage() {
  return (
    <LayoutWithSidebar sidebar="left" eligibilityCheck showBallot showInfo>
      <Projects />
    </LayoutWithSidebar>
  );
}
