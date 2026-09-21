import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialHero,
  PathwayIndex,
  EditorialClose,
} from "@/components/imageworks/expansion";
export const metadata = {
  title: "Solutions | Fortitudo",
  description:
    "Find the right starting point for a new product, a better website, ecommerce, connected operations or applied AI.",
};
export default function Page() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Solutions"
        title="A clear starting point for what comes next."
        lead="You do not need to arrive with a technical specification. Start with the change you want to make, then explore the work that can get you there."
      />
      <PathwayIndex />
      <EditorialClose />
    </LibraryMotion>
  );
}
