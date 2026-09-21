import { LibraryMotion } from "@/components/imageworks/library-motion";
import { EditorialHero } from "@/components/imageworks/expansion";
import { ProjectPlanner } from "@/components/imageworks/project-planner";
export const metadata = {
  title: "Project planner | Fortitudo",
  description:
    "Prepare a concise project brief before your first conversation with Fortitudo.",
};
export default function Page() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Project planner"
        title="Turn the idea into a useful brief."
        lead="A few decisions to make the first conversation easier. Choose the kind of work, your preferred timing and what you want to change."
        effect="02"
      />
      <ProjectPlanner />
    </LibraryMotion>
  );
}
