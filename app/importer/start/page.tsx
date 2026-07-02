import type { Metadata } from "next";
import { StartProjectWizard } from "@/components/importer/start-project-wizard";

export const metadata: Metadata = {
  title: "Start Import Project | ChinaPak ImportHub",
  description:
    "Urdu-first Import Project wizard for Pakistani importers to share product details, choose a package, and prepare payment or unpaid lead assistance.",
  robots: { index: false, follow: false },
};

export default function ImporterStartPage() {
  return (
    <main>
      <StartProjectWizard />
    </main>
  );
}
